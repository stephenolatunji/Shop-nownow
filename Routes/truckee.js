const express = require('express');
const router = express.Router();
require('dotenv').config();
const Order = require('../Models/Order');

//Get all orders for Truckee delivery
router.route('/deliveries')
    .get(async (req, res)=>{
        try{
            const orders = await Order.find({'truckee.delivery': true})
            .populate('bulkbreakerId', 'address latitude longitude ')
            .populate('pocId', 'address latitude longitude ')
            .populate('items', 'quantity details.brand details.sku details.volume')
            .lean();
            
            res.status(200).json({success: true, orders});
        }
        catch{
            res.status(500).json({success: false, msg: 'Server Error' });
        }
    });

//Get all new orders
router.route('/new/deliveries')
    .get(async(req, res)=>{
        try{
            const orders = await Order.find({status: 'confirmed', 'truckee.delivery': true})
            .populate('bulkbreakerId', 'address latitude longitude ')
            .populate('pocId', 'address latitude longitude ')
            .populate('items', 'quantity details.brand details.sku details.volume')
            .lean();
            res.status(200).json({success: true, orders});
        }
        catch{
            res.status(500).json({success: false, msg: 'Server Error' });
        }
    });

//Get all deliveries by a driver

router.route('/deliveries/:email')
    .get(async(req, res)=>{
        try{
            const order =  await Order.find({'truckee.driver': req.params.email})
            .populate('bulkbreakerId', 'address latitude longitude ')
            .populate('pocId', 'address latitude longitude ')
            .populate('items', 'quantity details.brand details.sku details.volume')
            .lean();
            res.status(200).json({success: true, order});
        }
        catch{
            res.status(500).json({success: false, msg: 'Server Error' });
        }
    });

router.route('/delivery/:id')
    
//Driver accepts an order and changes the status to dispatched
    .patch(async(req, res)=>{
        const email = req.body.email;
        try{
            let order;
            order = await Order.updateOne(
                {_id: req.params.id},
                {$set: {
                    truckee: {
                        delivery: true,
                        driver: email
                    },
                    status: 'dispatched'
                }}
            );
            order = await Order.findById({_id: req.params.id})
            .populate('bulkbreakerId', 'address latitude longitude ')
            .populate('pocId', 'address latitude longitude ')
            .populate('items', 'quantity details.brand details.sku details.volume')
            .lean();
            res.status(200).json({success: true, order});
        }
        catch{
            res.status(500).json({success: false, msg: 'Server Error' });
        }
    })

//Get order by ID
    .get(async(req, res)=>{
        try{
            const orders = await Order.findById({_id: req.params.id})
            .populate('bulkbreakerId', 'address latitude longitude ')
            .populate('pocId', 'address latitude longitude ')
            .populate('items', 'quantity details.brand details.sku details.volume')
            .lean();
            res.status(200).json({success: false, orders});
        }
        catch{
            res.status(500).json({success: false, msg: 'Server Error' });
        }
    });

router.route('/:id')
    .patch(async(req, res)=>{
        try{
            let order;
            order = await Order.updateOne(
                {_id: req.params.id},
                {$set: {status: 'delivered'}}
            );
            order = await Order.findById({_id: req.params.id})
            .populate('bulkbreakerId', 'address latitude longitude ')
            .populate('pocId', 'address latitude longitude ')
            .populate('items', 'quantity details.brand details.sku details.volume')
            .lean();
            
            res.status(200).json({success: true, order});
        }
        catch{
            res.status(500).json({success: false, msg: 'Server Error' });
        }
});

module.exports = router;