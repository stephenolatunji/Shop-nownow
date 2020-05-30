const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const pocSchema = new Schema({
    ID: {type: String},
    name: {type: String},
    phone: {type: String},
    region: {type: String},
    latitude: {type: String},
    longitude: {type: String},
});

const POC = mongoose.model('POC', pocSchema);
module.exports = POC;