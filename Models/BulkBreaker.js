const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bulkBreakerSchema = new Schema({
  ID: { type: String },
  name: { type: String },
  password: { type: String },
  phone: { type: String },
  latitude: { type: String },
  longitude: { type: String },
  delivery: { type: Boolean, default: false },
  product: [
    {
      brand: { type: String },
      sku: { type: String },
      volume: { type: String },
      image: { type: String },
      price: { type: Number },
    },
  ],
  payment: {
    cash: { type: Boolean, default: false },
    pos: { type: Boolean, default: false },
    transfer: { type: Boolean, default: false },
  },
  open: {type: Boolean, default: false},
  confirmed: { type: Boolean, default: false},
  contact:{
    phone:{type: Boolean, default: false},
    whatsapp: {type: Boolean, default: false}
  }
});

const BulkBreaker = mongoose.model("BulkBreaker", bulkBreakerSchema);

module.exports = BulkBreaker;
