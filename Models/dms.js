const mongoose = require("mongoose");
const mongooseAutoPopulate = require("mongoose-autopopulate");
const Schema = mongoose.Schema;

const dmsSchema = new Schema({
    ID:  { type: String },
    average: { type: Number }
});
const Dms = mongoose.model("Dms", dmsSchema);
module.exports = Dms;