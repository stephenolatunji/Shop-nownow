const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
    brand: {type: String},
    sku: {type: String},
    volume: {type: String},
    recommendedPrice: {
        bb: { type: String },
        poc: { type: String }
    },
    image: {type: String}
});
const Product = mongoose.model('Product', productSchema);
module.exports = Product;