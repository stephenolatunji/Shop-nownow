const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const subscriptionSchema = new Schema({
  ID: { type: String },
  endpoint: { type: String },
  p256dh: { type: String },
  auth: { type: String },
});



const Subscription = mongoose.model("Subscription", subscriptionSchema);
module.exports = Subscription;
