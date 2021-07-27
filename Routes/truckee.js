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

//Get all new orders
router.route('/new/deliveries')
    .get(async(req, res)=>{
        try{
            const orders = await Order.find({status: 'confirmed', 'truckee.delivery': true}).lean();
            res.status(200).json({success: false, orders});
        }
        catch{
            res.status(500).json({success: false, msg: 'Server Error' });
        }
    });

//Get all deliveries by a driver

router.route('/deliveries/:email')
    .get(async(req, res)=>{
        try{
            const order =  await Order.find({'truckee.driver': req.params.email}).lean();
            res.status(200).json({success: true, order});
        }
        catch{
            res.status(500).json({success: false, msg: 'Server Error' });
        }
    });

router.route('/delivery/:id')
    
//Driver accepts an order and changes the status to dispatched
    .patch(async(req, req)=>{
        const email = req.body.status;
        try{
            let order;
            order = await Order.updateOne(
                {_id: req.params.id},
                {$set: {
                    truckee: {
                        driver: email
                    },
                    status: 'dispatched'
                }}
            );
            order = await Order.findById({_id: req.params.id}).lean();
            res.status(200).json({success: true, order});
        }
        catch{
            res.status(500).json({success: false, msg: 'Server Error' });
        }
    });

router.route('/:id')
    .patch(async(req, req)=>{
        try{
            let order;
            order = await Order.updateOne(
                {_id: req.params.id},
                {$set: {status: 'delivered'}}
            );
            order = await Order.findById({_id: req.params.id}).lean();
            res.status(200).json({success: true, order});
        }
        catch{
            res.status(500).json({success: false, msg: 'Server Error' });
        }
});

module.exports = router;