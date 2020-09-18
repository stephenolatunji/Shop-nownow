const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const shopperSchema = new Schema({
    firstname: { type: String, required: true, trim: true },
    lastname: { type: String, required: true, trim: true},
    email: { type: String, required: true, trim: true },
    password: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true }

});
const Shopper = mongoose.model('Shopper', shopperSchema);
module.exports = Shopper;