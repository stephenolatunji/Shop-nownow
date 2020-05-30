const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bulkBreakerSchema = new Schema({
    ID: {type: String},
    name: {type: String },
    address: {type: String},
    phone: {type: String},
    LGA: {type: String},
    latitude: {type: String},
    longitude: {type: String}
});

const BulkBreaker = mongoose.model('BulkBreaker', bulkBreakerSchema);

module.exports = BulkBreaker;