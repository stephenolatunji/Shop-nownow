const mongoose = require("mongoose");
const mongooseAutoPopulate = require("mongoose-autopopulate");
const Schema = mongoose.Schema;

const bulkBreakerSchema = new Schema({
  ID: { type: String },
  name: { type: String },
  password: { type: String },
  phone: { type: String },
  address: { type: String },
  whatsapp: {type: String},
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
        poc: { type: Number }
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
      customerName: {
        type: String
        // type: Schema.Types.ObjectId,
        // ref: 'Poc',
        // autopopulate: true
      },
      comment: {type: String}
    }
  ],
  ratings: {
    rater: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    star: { type: String }
  },
  dms: {type: Number},
  mydream: {
   name:{ type: String},
   point: {type: Number},
   duration: {type: Number},
   time: {type: Date, default: Date.now()}
  },
  points: {type: Number, default: 0},
  bdr: { type: String },
  lastLogin: {type: Date}
});

bulkBreakerSchema.plugin(mongooseAutoPopulate);

const BulkBreaker = mongoose.model("BulkBreaker", bulkBreakerSchema);
module.exports = BulkBreaker;
