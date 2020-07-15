const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Order = require("../Models/Order");
const Item = require("../Models/Items");
const BulkBreaker = require("../Models/BulkBreaker");
const Distributor = require("../Models/Distributor");
const Poc = require("../Models/Pocs");

router
  .route("/")
  .post(async (req, res) => {console.log(req.body)
    const { userType, products, requesterID } = req.body;

    try {
      const productOwners = new Set(products.map((product) => product.userID))
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

        let order;

        if (totalItemsQuantity < 80) {
          order = new Order({
            [`${userType}Id`]: requesterID,
            items: itemIDs,
            ownerId: productOwner,
            ownerType: productOwnersProds[0].ownerType,
            totalAmount: itemPrices.reduce(
              (acc, item) => acc + item.quantity * (item.price * 1.0241),
              0
            ),
          });
        } else {
          order = new Order({
            [`${userType}Id`]: requesterID,
            items: itemIDs,
            ownerId: productOwner,
            ownerType: productOwnersProds[0].ownerType,
            totalAmount: itemPrices.reduce(
              (acc, item) => acc + item.quantity * item.price,
              0
            ),
          });
        }
        await order.save();
      }
      return res.status(201).json({
        success: true,
      });
    } catch (err) {
      console.log(err);
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

router.route("/:_id").patch(async (req, res) => {
  try {
    const order = await Order.updateOne(
      { _id: req.params._id },
      { $set: { status: req.body.status } }
    );
    return res.status(200).json({
      success: true,
      order,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err });
  }
});
module.exports = router;
