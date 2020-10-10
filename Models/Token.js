const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const tokenSchema = new Schema({
    otp: { type: Number },
    status: {type: String}
});
const Token = mongoose.model('Token', tokenSchema);
module.exports = Token;