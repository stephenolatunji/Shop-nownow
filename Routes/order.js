const express = require("express");
require('dotenv').config();
const router = express.Router();
const mongoose = require("mongoose");
const request =  require("request");
const randomize = require("randomatic");
const webpush = require('web-push');

const Order = require("../Models/Order");
const Item = require("../Models/Items");
const BulkBreaker = require("../Models/BulkBreaker");
const Distributor = require("../Models/Distributor");
const Poc = require("../Models/Pocs");

webpush.setVapidDetails('mailto:info@ibshopnow.com', process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);

router.route("/")
  .post(async (req, res) => {
    const { userType, products, requesterID, sellerMobile, buyerMobile, seller, buyer } = req.body;

    try {
      const productOwners = new Set(products.map((product) => product.userID));
      const totalItemsQuantity = products.reduce(
        (acc, product) => acc + product.quantity,
        0
      );
      for await (let productOwner of productOwners) {
        const productOwnersProds = products.filter(
          (product) => product.userID === productOwner
        );
        const itemPrices = [];
        const itemIDs = [];
        for await (let product of productOwnersProds) {
          const item = new Item({
            details: { ...product },
            quantity: product.quantity,
          });
          await item.save();
          itemIDs.push(item._id);
          itemPrices.push({ quantity: item.quantity, price: item.details.price });
        }
        // const multiplyBy = totalItemsQuantity >= 80 ? 0.981 : 1;

        const total = itemPrices.reduce(
              (acc, item) => acc + item.quantity * item.price,
              0
            );
        let order;

        // if (totalItemsQuantity < 80) {
        //   order = new Order({
        //     [`${userType}Id`]: requesterID,
        //     items: itemIDs,
        //     ownerId: productOwner,
        //     ownerType: productOwnersProds[0].ownerType,
        //     totalAmount: itemPrices.reduce(
        //       (acc, item) => acc + item.quantity * (item.price * 1.0241),
        //       0
        //     ),
        //     sellerMobile,
        //     buyerMobile
        //   });
        // } 
          order = new Order({
            orderId : randomize('aA0', 6),
            seller: seller,
            buyer,
            [`${userType}Id`]: requesterID,
            items: itemIDs,
            ownerId: productOwner,
            ownerType: productOwnersProds[0].ownerType,
            totalAmount: total,
            sellerMobile,
            buyerMobile
          });
        ;
        // message
        const sellerMessage = `Dear ${seller}, you have recieved an order of #${total}from ${buyer}, kindly log on to your App to confirm the order.`;
        const buyerMessage = `Dear ${buyer}, your order has been successfully placed. Kindly wait for confirmation from the ${seller}.`
        sendSms(sellerMessage, sellerMobile);
        sendSms(buyerMessage, buyerMobile);

        await order.save();
      }
      res.status(201).json({
        success: true,
      });
    } catch (err) {
      res.status(500).send({ sucess: false, error: err.messsage });
    }
  })

  .get(async (req, res) => {
    try {
      const { userType, ID } = req.query;
      const orders = await Order.find({
        [`${userType}Id`]: mongoose.Types.ObjectId(ID),
      })
        .populate("items")
        .lean();
      const completeOrders = [];
      for await (const order of orders) {
        let user = {};
        if (order.ownerType === "bulkbreaker") {
          user = await BulkBreaker.findOne({ ID: order.ownerId })
            .select("-password")
            .lean();
        } else if (order.ownerType === "poc") {
          user = await Poc.findOne({ ID: order.ownerId }).select("-password").lean();
        } else if (order.ownerType === "distributor") {
          user = await Distributor.findOne({ ID: order.ownerId })
            .select("-password")
            .lean();
        }
        completeOrders.push({ ...order, owner: { ...user } });
      }
      return res.status(200).json({
        success: true,
        orders: completeOrders,
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err });
    }
  });


router.route("/:userID").get(async (req, res) => {
  try {
    const { userID } = req.params;
    const orders = await Order.find({ ownerId: userID }).populate("items").lean();
    const userOrders = [];
    for await (const order of orders) {
      let user;
      if (order.bulkbreakerId) {
        user = await BulkBreaker.findById(
          order.bulkbreakerId,
          "-password"
        ).lean();
      } else if (order.distributorId) {
        user = await Distributor.findById(
          order.distributorId,
          "-password"
        ).lean();
      } else {
        user = await Poc.findById(order.pocId, "-password").lean();
      }
      userOrders.push({ ...order, user });
    }
    return res.status(200).json({
      success: true,
      orders: userOrders,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, error });
  }
});

router.route("/:_id")
  .patch(async (req, res) => {
    const status = req.body.status;
    try {
      const order = await Order.updateOne(
        { _id: req.params._id },
        { $set: { status: status } }
      );
      const order_ = await Order.findById({_id: req.params._id}).lean();
      const buyerMobile = order_.buyerMobile;

      if(status == 'delivered' && order_.bulkbreakerId !== null){
        let totalQty = 0;

        order_.items.forEach(async item_id=> {
            const qty = await Item.findById({_id: item_id}, 'quantity').lean();
            totalQty += parseFloat(qty.quantity);
            const point = await BulkBreaker.updateOne(
              { _id: order_.bulkbreakerId },
              { $set: { points: totalQty } }
            );
        })
      }
      else if(status == 'confirmed' || status == 'cancelled'){
        const message = `Dear customer, your order has been ${status} by the seller.`;
        sendSms(message, buyerMobile);
      };

      return res.status(200).json({
        success: true,
        order_
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err });
    }
  })

  .get(async(req, res) => {
    try{
      const order = await Order.findById({_id: req.params._id}).lean();
      res.status(200).json({
        success: true,
        order
      })
    }
    catch(err){
      res.status(500).json({
        Error: err,
        success: false
      })
    }
  });

router.route('/one/:_id').get(async (req, res) => {
  try {
    const order = await Order.findById({ _id: req.params._id }).lean();

    res.json({
      success: true,
      order
    })
  }
  catch (err) {
    res.status(500).json({
      success: false,
      Error: err
    })
  }
})


router.route('/delivered/:userId').get(async (req, res) => {
  const userId = req.params.userId;
  try{
    const deliveredOrders = await Order.countDocuments({
      ownerId: userId,
      status: 'delivered'
    });

    res.status(200).json({
      success: true,
      deliveredOrders
    })
  }
  catch(err){
    res.status(500).json({
      success: false,
      Error: err
    })
  }
});

router.route('/push-notification').post(async(req, res) => {
  const {subscription, order } = req.body;
  try{

    const order_ = await Order.findById({_id: order});
    const payload = JSON.stringify({
    title: `<h2>Hello!</h2>`,
    body: `<p>You have received an order of #${order_.totalAmount} from ${order_.buyer}.</p> 
        <p>Click to view details</p>`,
    });
    const reciever = order_.ownerId
    webpush.sendNotification(subscription, payload, reciever)
      .then(result => console.log(result))
      .catch(e => console.log(e.stack))

    res.status(200).json({success: true})
  } 
  catch(err){
    
  }


});

router.route("/checkOrder/:userID")
.get(async (req, res) => {

  try {
    const { userID } = req.params;
    const orders = await Order.find({ ownerId: userID, status: 'new' })
    .lean();

    return res.status(200).json({
      success: (orders.length > 0)? true : false,
      order: orders[0],
      orderSize: orders.length
    });
  } 

  catch (error) {
    console.log(error);
    return res.status(500)
    .json({ success: false, error });
  }
});

  
function sendSms(message, mobile) {
  request(`${process.env.messageApi}messagetext=${message}&flash=0&recipients=234${mobile.slice(1)}`, { json: true }, (err, res, body) => {
    if (err) console.log(err); 
    return true;
  });
};

module.exports = router;