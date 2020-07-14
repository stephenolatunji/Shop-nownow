const mongoose = require("mongoose");
const mongooseAutoPopulate = require("mongoose-autopopulate");
const Schema = mongoose.Schema;

const distributorSchema = new Schema({
  ID: { type: String },
  name: { type: String },
  password: { type: String },
  phone: { type: String },
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
        bb: { type: Number },
        poc: { type: Number }
       },
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
      ratings: {type: Number},
      comment: {type: String}
    }
  ]

});

distributorSchema.plugin(mongooseAutoPopulate);

const Distributor = mongoose.model("Distributor", distributorSchema);
module.exports = Distributor;
