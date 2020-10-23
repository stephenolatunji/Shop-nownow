const mongoose = require("mongoose");
const Order = require("./Order");
const mongooseAutoPopulate = require("mongoose-autopopulate");
const Schema = mongoose.Schema;

const pocSchema = new Schema({
  ID: { type: String },
  name: { type: String },
  password: { type: String },
  phone: { type: String },
  address: { type: String },
  whatsapp : { type: String},
  viaphone: {type: Boolean, default: false},
  viawhatsapp: {type: Boolean, default: false},
  latitude: { type: String },
  longitude: { type: String },
  delivery: { type: Boolean, default: false },
  product: [
    {
      brand: { type: String },
      sku: { type: String },
      volume: { type: String },
      image: { type: String },
      price: { 
        cp: { type: Number }
      },
      soldOut: {type: Boolean, default: false}
    },
  ],
  payment: {
    cash: { type: Boolean, default: false },
    pos: { type: Boolean, default: false },
    transfer: { type: Boolean, default: false },
  },
  activated: {type: Boolean, default: false},
  confirmed: { type: Boolean, default: false},
  reviews: [
    {
      customerId: {
        type: Schema.Types.ObjectId,
        ref: 'Poc',
        autopopulate: true
      },
      comment: { type: String }
    }
  ],
  ratings: {
    rater: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    star: { type: String },
  },
  bdr: { type: String }

});
pocSchema.plugin(mongooseAutoPopulate);
const Poc = mongoose.model("Poc", pocSchema);
module.exports = Poc;
