const express = require('express');
const router = express.Router();
require('dotenv').config();
const bcrypt = require('bcryptjs');
const randomize = require('randomatic');

const Bdr = require('../Models/BDR');
const Poc = require('../Models/Pocs');
const request  = require('request');
const Order = require('../Models/Order');



router.route('/')
    .get(async (req, res) => {
        try{
            const bdr = await Bdr.find()
            .select('-password')
            .lean()
            .limit(100);
            res.json(bdr);
        }
        catch(err){
            console.log(err);
            res.status(500).send({success: false, err})
        }
    });

   
router.route('/login')
    .post(async (req, res) => {
            const {email, password } = req.body;

            try{

                const bdr = await Bdr.findOne({email});
                
                if(!bdr){
                    return res.status(401).send({success: false, msg: 'Unauthorized User'})
                }
                
                const isMatch = await bcrypt.compare(password, bdr.password);

                if(!isMatch){
                    return res.status(400).send({
                    message: 'Invalid credential',
                    success: false
                    })
                }
                else {
                    res.json({
                        success: true,
                        bdr
                    });
                }

            }
            catch(err){
                res.status(500).send({sucess: false, err})
            }
    });

router.route('/:_id')
    
    .get(async (req, res) => {
        
        try{
            const bdr = await Bdr.findById({_id: req.params._id}, '-password').lean();
            res.json({
                success: true,
                bdr
            })
        }
        catch(err){
            res.status(500).send({
                success: false,
                msg: 'Server Error'
            })
        }
    });

router.route('/changepassword/:_id')
    .patch(async (req, res) => {
        const password = req.body.password;
        const activated = true;
        
        try{
            const salt = await bcrypt.genSalt(10);
            const hashed = await bcrypt.hash(password, salt);

            const bdr = await Bdr.updateOne(
                { _id: req.params._id },
                {
                    $set: {
                        password: hashed,
                        activated: activated
                    }
                }
            )

            res.status(200).json({
                success: true,
                bdr
            });
        }
        catch(err){
            res.status(500).send({
                sucess: false,
                err
            })
        }

    });


    
router.route('/user/:email')
    
.get(async (req, res) => {
    
    try{

        const bdr = await Bdr.findOne({email: req.params.email}).lean();
        res.json({
            success: false,
            bdr
        })
    }
    catch(err){
        res.status(500).send('Sever Error')
    }
});

//  Fetch Outlets

router.route('/outlets/:email')
    .get(async(req, res) =>{
        const email = req.params.email;

        try{
            const pocs = await Poc.find({bdr: email}, 'name ID longitude latitude address phone whatsapp address').lean();
            // const bulkbreaker = await BulkBreaker({bdr: email}, 'name ID longitude latitude address phone whatsapp');
            res.json({
                success: true,
                pocs,
                // bulkbreaker
            })
        }
        catch(err){
            res.status(500).json({
                success: false,
                msg: err
            })
        }
    });


// Create OTP for BDR

router.route('/otp')

    .post(async(req, res) => {
        try{
            const { otp, outletNumber } = req.body;
            const message = `Your order verification code is: ${otp}. Please this code expires in 15 minutes.`;
            sendSms(message, outletNumber);
            res.status(200).json({
                success: true,
                msg: 'sent'
            })
        }
        catch(err){
            res.status(500).json({
                success: false,
                msg: err
            })
        }
    });

    router.route('/order/new/:email')
        .get(async(req, res) => {
            const email = req.params.email;

            try{
                const orders = await Order.find({'pocId':{ $ne: null}})
                .populate('pocId', 'bdr name phone')
                .populate('items')
                .lean().then(data=>{  
                    const result = data.filter(element=>element.pocId.bdr == email);

                    res.status(200).json({
                        success: true,
                        result
                    })
                })
    
            }
            catch(err){
                res.status(500).json({
                    success: false,
                    msg: err
                })
            }
        });

function sendSms(message, mobile) {
    request(`${process.env.messageApi}messagetext=${message}&flash=0&recipients=234${mobile.slice(1)}`, { json: true }, (err, res, body) => {
        if (err) console.log(err);
        return true;
    });
};

module.exports = router;