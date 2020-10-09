const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bdrSchema = new Schema({
    email: {type: String},
    password: { type: String },
    activated: {type: Boolean}
    // email: {type: String},
    // ID: { type: String }
});

const Bdr = mongoose.model('Bdr', bdrSchema);
module.exports = Bdr;