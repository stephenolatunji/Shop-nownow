const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
    brand: {type: String},
    sku: {type: String},
    volume: {type: String},
    combo: {type: Boolean},
    recommendedPrice: {
        bb: { type: String },
        poc: { type: String },
        cp: {  type: String}
    },
    image: {type: String}
});
const Product = mongoose.model('Product', productSchema);
module.exports = Product;