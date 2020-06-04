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

    items: [
      {
        type: Schema.Types.ObjectId,
        ref: "Item",
        required: true,
        autopopulate: true,
      },
    ],

    totalAmount: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      default: "processing",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

OrderSchema.plugin(mongooseAutoPopulate);

const Order = mongoose.model("Order", OrderSchema);
module.exports = Order;
