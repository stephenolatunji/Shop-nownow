const mongoose = require("mongoose");
const mongooseAutoPopulate = require("mongoose-autopopulate");
const Schema = mongoose.Schema;

const addressSchema = new Schema({
    ID:  { type: String },
    address: { type: String }
});
const Address = mongoose.model("Address", addressSchema);
module.exports = Address;