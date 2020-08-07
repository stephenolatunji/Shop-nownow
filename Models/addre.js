const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const addressSchema = new Schema({
    ID: {type: String},
    address: { type: String }
});

const Addre = mongoose.model('Addre', addressSchema);
module.exports = Addre