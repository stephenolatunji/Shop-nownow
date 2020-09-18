const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const shopperOrderSchema = new Schema({
    seller: {
        type: Schema.Types.ObjectId,
        ref: "Poc",
        autopopulate: true,
    },
    userInfo: {
        firstname: { type: String, required: true, trim: true },
        lastname: { type: String, required: true, trim: true},
        email: { type: String, required: true, trim: true },
        address: { type: String, required: true, trim: true },
        city: { type: String, required: true, trim: true },
        state: { type: String, required: true, trim: true },
        phone: { type: String, required: true, trim: true }
        // type: Schema.Types.ObjectId,
        // ref: "User",
        // required: true,
        // autopopulate: true,
    },
    products: [
        {
            brand: { type: String },
            sku: { type: String },
            volume: { type: String },
            quantity:  {type: Number},
            price: {type: String}
        }
    ],
    // quantity: {type: Number},
    amount: {
        subTotal: { type: Number },
        vat: { type: Number },
        shipping: { type: Number },
        total: { type: Number }

    },
    status: { type: String, default: 'pending'},
    cicAgent: { type: String },
    cicStatus: { type: String },
    comment: { type: String }

},
    {
        timestamps: true
    }
);
const shopperOrder = mongoose.model('shopperOrder', shopperOrderSchema);
module.exports = shopperOrder;