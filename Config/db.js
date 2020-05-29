const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try{

        await mongoose.connect(process.env.MONGO_URI, {
            useCreateIndex: true,
            useFindAndModify: false,
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('DB Connected...')
    }
    catch(err){
        console.error(err.message);
    }
};

module.exports = connectDB;