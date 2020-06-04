const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
    brand: {type: String, },
    sku: {type: String},
    volume: {type: String},
    image: {type: String},
    productId: {type: Number},
    price: {type: Number}
});
const Product = mongoose.model('Product', productSchema);
module.exports = Product;