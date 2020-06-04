const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const itemSchema = new Schema({
    product:[
        { 
        type: Schema.Types.ObjectId,
        ref: 'Product'
    }
    ],
    quantity: {
        type:  Number,
        required: true,
        min: [1, 'Quantity not less than 1']
    },
    
    total: {
        type: Number,
        required: true
    }
},{
    timestamps: true
});

const Item = mongoose.model('Item', itemSchema);
module.exports = Item;