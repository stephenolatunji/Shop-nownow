require('dotenv').config();
const paystack = require('paystack')(process.env.PAYSTACK_KEY);

module.exports = {
    verifyOrder: (reference) => {
        return new Promise((resolve, reject) => {
            paystack.transaction.verify(reference, (error, body) => {
                if(error){
                    reject(error)
                }else{
                    resolve(body)
                }
            })
        })
    }
};