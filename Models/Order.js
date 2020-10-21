const mongoose = require("mongoose");
const mongooseAutoPopulate = require("mongoose-autopopulate");

const Schema = mongoose.Schema;

const OrderSchema = new Schema(
  {
    pocId: {
      type: Schema.Types.ObjectId,
      ref: "Poc",
      default: null,
      autopopulate: true,
    },

    bulkbreakerId: {
      type: Schema.Types.ObjectId,
      ref: "BulkBreaker",
      default: null,
      autopopulate: true,
    },
    distributorId: {
      type: Schema.Types.ObjectId,
      ref: "Distributor",
      default: null,
      autopopulate: true,
    },
    orderId: {type: String},
    ownerType: { type: String },
    ownerId: { type: String},
    // seller: {type: String},
    items: [
      {
        type: Schema.Types.ObjectId,
        ref: "Item",
        required: true,
        autopopulate: true,
      }
    ],
    totalAmount: {
      type: Number,
      default: 0,
    },
    buyerMobile: { type: String },
    sellerMobile: { type: String },
    status: {
      type: String,
      default: "new",
      required: true,
    },
    cicAgent: { type: String },
    cicStatus: { type: String },
    comment: { type: String }
},
  {
    timestamps: true,
  }
);

OrderSchema.plugin(mongooseAutoPopulate);

const Order = mongoose.model("Order", OrderSchema);
module.exports = Order;
