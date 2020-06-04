const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');

const Order = require("../Models/Order");
const Item = require("../Models/Items");

router
  .route("/")
  .post(async (req, res) => {
    const { userType, products, total, requesterID } = req.body;

    try {
      const itemIDs = [];
      for await (let product of products) {
        const item = new Item({
          details: {...product},
          quantity: product.quantity,
        });
        await item.save();
        itemIDs.push(item._id);
      }

      const order = new Order({
        [`${userType}Id`]: requesterID,
        items: itemIDs,
        totalAmount: total,
      });
      await order.save();

      return res.status(201).json({
        success: true,
        data: order,
      });
    } catch (err) {
        console.log(err);
      res.status(500).send({ sucess: false, error: err.messsage });
    }
  })
  .get(async (req, res) => {
    try {
      const { userType, userID } = req.query;
      console.log(req.query);
      const orders = await Order.find({
        where: {
          [`${userType}Id`]: mongoose.Types.ObjectId("5ed7a8a17af5370e30164125"),
        },
      });
      return res.status(200).json({
        success: true,
        orders,
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err });
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
