const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const pocOwnerSchema = new Schema({
    distributor: {
        type: Schema.Types.ObjectId,
        ref: 'Distributor'
    },
    // ID: {
    //     type: String
    // },
    password: {
        type: String,
        required: true
    }
});
const PocOwner = mongoose.model('PocOwner', pocOwnerSchema);
module.exports = PocOwner
