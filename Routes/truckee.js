const express = require('express');
const router = express.Router();
require('dotenv').config();
const Order = require('../Models/Order');

//Get all orders for Truckee delivery
router.route('/deliveries')
    .get(async (req, res)=>{
        try{
            const orders = await Order.find({'truckee.delivery': true}).lean();
            res.status().json({success: true, orders})
        }
        catch{
            res.status(500).json({success: false, msg: 'Server Error' });
        }
    });

router.route('/new/deliveries')
    .get(async(req, res)=>{
        try{
            const orders = await Order.find({status: 'confirmed', 'truckee.delivery': true}).lean();
            res.status(200).json({success: false, orders});
        }
        catch{
            res.status(500).json({success: false, msg: 'Server Error' });
        }
    })