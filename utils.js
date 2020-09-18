// const express = require('express'),
// const router = express.Router()
// const mongoose = require('mongoose')
require('dotenv').config();
const paystack = require('paystack')(process.env.PAYSTACK_KEY);

module.exports = {
    verifyOrder: (reference) => {
        return new Promise((resolve, reject) => {console.log('awa niyen')
            paystack.transaction.verify(reference, (error, body) => {
                console.log(error)
                if(error){
                    reject(error)
                }else{
                    resolve(body)
                }
            })
        })
    }
};