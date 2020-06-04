const mongoose = require('mongoose');
const Schema = mongoose.Schema;


orderSchema = new Schema({
    pocId: {
        type: Schema.Types.ObjectId,
        ref: 'Poc'
    },

    bulkBreakerId: {
        type: Schema.Types.ObjectId,
        ref: 'Bulkbreaker'
    },
    distributorId: {
        type: Schema.Types.ObjectId,
        ref: 'Distributor'
    },

    items: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Item',
            required: true
        }
    ],

    totalAmount: {
        type: Number,
        default: 0
    },

    status: {
        confirmed: {
            type: Boolean,
            default: false
        },
        processing: {
            type: Boolean,
            default: true
        },
        declined: {
            type: Boolean,
            default: false
        },
        cancelled: {
            type: Boolean,
            default: false
        }
    },

    
},{
    timestamps: true
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;