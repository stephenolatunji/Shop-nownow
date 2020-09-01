const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userOrderSchema = new Schema({
    seller: {
        type: Schema.Types.ObjectId,
        ref: "Poc",
        required: true,
        autopopulate: true,
    },
    userInfo: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        autopopulate: true,
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
    status: { type: String },
    cicAgent: { type: String },
    cicStatus: { type: String },
    comment: { type: String }

},
    {
        timestamps: true
    }
);
const UserOrder = mongoose.model('UserOrder', userOrderSchema);
module.exports = UserOrder;