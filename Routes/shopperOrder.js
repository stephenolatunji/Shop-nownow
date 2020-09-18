const express = require('express');
const router = express.Router();
require('dotenv').config();
const sendGrid = require('@sendgrid/mail')

const ShopperOrder = require('../Models/shopperOrder');
const {verifyOrder} = require('../utils');


router.route('/order')
    
    .post(async(req, res) => {
        const { userInfo, products, amount, reference} = req.body;
        let paystackData;
        try{
            paystackData = await verifyOrder(reference);
        
            //If invalid reference then order is invalid
            if(!paystackData.status){
                return res.status(400).json({
                    success: false,
                    message: 'Order not valid',
                })
            }

            if(paystackData.data.amount !==( amount * 100 )){
                return res.status(400).json({
                    success: false,
                    msg: 'Order not valid'
                })
            }
            //if reference number already exists, shopper reused reference number, order is invalid
            const previousOrder = await ShopperOrder.findOne({reference});
            if(previousOrder){
                return res.status(400).json({
                    success: false,
                    msg: 'Invalid Order'
                })
            }
            
            const newOrder = await ShopperOrder.create({
                userInfo,
                amount,
                reference,
                products
            });
            const email = userInfo.email;
            const name = userInfo.firstname + ' ' + userInfo.lastname;

            sendGrid.setApiKey(process.env.SENDGRID_KEY);
            const msg = {
                to: email,
                from: 'info@eyemarket',
                subject: 'IBShopNow: Your Order Confirmation',
                html: `<h3>Dear ${name}</h3>
                    <p>You have successfully placed an order of ${amount} on our platform</p></br>
                    <p>Kindly wait for confirmation from our sellers</p>`
                };

            (async () => {
                try {
                    await sendGrid.send(msg);
                } catch (error) {
                    console.error(error);
                
                    if (error.response) {
                    console.error(error.response.body)
                    }
                }
                })();
            res.status(200).json({
                success: true,
                newOrder
            })

        }
        catch(err){
            res.status(500).json({
                success: false,
                msg: err
            })
        }
    
    })
    .get(async(req, res) =>{
    try{
        const orders = await ShopperOrder.find().lean();
        res.json(orders)
    }
    catch(err){
        res.status(500).send(err)
    }
    });

router.route('/order/:id')
.get(async(req, res)=> {
    try {
        const order = await ShopperOrder.findOne({_id: req.params.id}).lean();
        res.json(order)
    }
    catch (err) {
        res.status(500).send(err)
    }
})
.patch(async (req, res) => {
   
    try {
        const user = await User.updateOne(
            { _id: req.params.id },
            { $set: req.body }
            );
            const result = await ShopperOrder.findById({ _id: req.params.id }).lean();
            return res.status(200).json({
                success: true,
                result,
            });
        } catch (err) {
            res.status(500).json({ success: false, error: err });
        }
        
    })
  
router.route('/user_order/:id')
    .get(async(req, res)=> {
        try {
            const order = await ShopperOrder.find({userInfo: req.params.id})
            .populate('seller', 'ID name phone address phone -_id')
            .populate('userInfo', 'firstname lastname phone email address city -_id')
            .populate('products')
            .lean();
            res.json(order)
        }
        catch (err) {
            res.status(500).send(err)
        }
    });
module.exports = router;