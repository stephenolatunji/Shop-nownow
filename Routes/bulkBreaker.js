const express = require('express');
const router = express.Router();
require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const request = require('request');
const randomString = require('randomstring');

const BulkBreaker = require('../Models/BulkBreaker');
const Bdr = require('../Models/BDR');
const Order = require('../Models/Order');
const Subscription = require('../Models/Subscription');
const webpush = require('web-push');
webpush.setVapidDetails('mailto:info@ibshopnow.com', process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);
router.route('/').get(async (req, res) => {
    try{
        const bulkBreaker = await BulkBreaker.find()
        .select('-password')
        .lean();
        res.json(bulkBreaker);
    }
    catch(err){
        res.status(500).send({success: false, err})
    }
})

    // .post(async(req, res) =>{
    //     const { ID, name, latitude, longitude} = req.body;
    //     try{

    //       let bulkBreaker = new BulkBreaker({
    //           ID,
    //           name,
    //           latitude,
    //           longitude
    //       });

    //       await bulkBreaker.save();
    //       res.json(bulkBreaker)
    //     }
    //     catch(err){
    //         res.status(500).send({
    //             success: false,
    //             Error: err
    //         })
    //     }
    // });

router.route('/login').post(async (req, res) => {
        const {ID, password } = req.body;
    try{
        const bulkBreaker = await BulkBreaker.findOne({ID});
        if(!bulkBreaker){
            return res.status(401).send({success: false, msg: 'Unauthorized User'})
        }
        const isMatch = await bcrypt.compare(password, bulkBreaker.password)
        if(!isMatch){
            return res.status(400).send({
                success: false,
                message: 'Invalid credential'
            })
        }
        else {
            if(bulkBreaker.lastLogin == null){
                await BulkBreaker.updateOne(
                    {ID: ID},
                    {$set: {lastLogin: Date.now()}
                }
                    )
            }
            res.json({
                success: true,
                bulkBreaker,
            });
        }
    }
    catch(err){
        res.status(500).send({sucess: false, err})
    }
});


router.route('/:_id')
    .patch(async (req, res) => {
        try{
            const bulkBreaker = await BulkBreaker.updateOne(
            { _id: req.params._id},
            {$set: req.body}
            );
            const result = await BulkBreaker.findById({ _id: req.params._id }, '-password').lean();
            res.json({
                success: true,
                result
            });
        }
        catch(err){
            res.status(500).send({ success: false, err})
        }
    })

    .get(async (req, res) => {
        try{

            const bulkBreaker = await BulkBreaker.findById({_id: req.params._id}, '-password').lean();
            const orders = await Order.find({buyerID: bulkBreaker.ID})
            res.json({bulkBreaker, orders})
        }
        catch(err){
            res.status(500).send('Server Error')
        }
    });

router.route('/changepassword/:_id').patch(async (req, res) => {
    const password = req.body.password;
    const activated = true;
    try{
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(password, salt);

        const bulkbreaker = await BulkBreaker.updateOne(
            {_id: req.params._id},
            {$set: {password: hashed, 
                    activated: activated
                    }
            }
        );
        res.status(200).json({
            success: true,
            bulkbreaker
        });
    }
    catch(err){
    
        res.status(500).send({
            success: false,
            err
        })
    }

    });

// 
router.route('/User/:ID')
    .get(async (req, res) => {
        try{

            const bulkBreaker = await BulkBreaker.find({ ID: req.params.ID}, '-password').lean();
            res.json(bulkBreaker);
        }
        catch(err){
            res.status(500).send({
                success: false,
                err
            })
        }
});

// forgot password
router.route('/forgotPassword')
    .post(
        async (req, res) => {
            const newPassword = randomString.generate({
                length: 4,
                charset: 'alphabetic'
            }).toLocaleLowerCase();

            const salt = await bcrypt.genSalt(10);
            const hashed = await bcrypt.hash(newPassword, salt);

            const mobile = req.body.mobile;
            const ID = req.body.userId;
            
            try {
                const bulkbreaker = await BulkBreaker.updateOne(
                    { ID: ID, phone: mobile },
                    { $set: {password: hashed } }
                );
                // send sms
               sendSms(ID, mobile, newPassword);
               res.json({status: true})
            }
            catch(err){
                res.status(500).send('Server Error')
            }
        })


// sms
function sendSms(userId, mobile, password) {

    const message = `Congratulations! Your new password is ${password} with user Id: ${userId}. Kindly Proceed to Login via the App!`;
    const _mobile = mobile.slice(1);

    request(`${process.env.messageApi}messagetext=${message}&flash=0&recipients=234${_mobile}`, { json: true }, (err, res, body) => {
        if (err) return console.log(err); 
        console.log(body);
    });

};

router.route('/rateme/:_id')
    .patch(async (req, res) => {

        const {rate, name, review} = req.body;

        try {
            let rateme = await BulkBreaker.findOne({ _id: req.params._id }).select('ratings');
            rateme = rateme.ratings;
            const rater = parseInt(rateme.rater + 1);

            const rating = parseFloat(rateme.rating) + parseInt(rate);

            const newRating = await BulkBreaker.updateOne(
                { _id: req.params._id },
                {
                    $set: {
                        ratings: {
                            rater: rater,
                            rating: rating,
                            star: rating / rater
                        },
                        reviews: [
                            {
                                customerName: name,
                                comment: review
                            }

                        ]

                    }
                }
            )
            res.send('Updated');
        }
        catch (err) {
            return res.status(500).json({
                success: false,
                Error: err
            })
        }
    });

// I have a dream, a song to sing, if you see the wonder of a fairy tale.
router.route('/mydream/:ID')
    .get(async(req, res)=>{
        try{
            const bbdream = await BulkBreaker.find({ID: req.params.ID}, 'dms points mydream');
            const dms = bbdream[0].dms;
            const points = bbdream[0].points;
            const dreamPoint = bbdream[0].mydream.point;

            const sum = dms + points;
            if(sum >= dreamPoint){
                return res.status(200).json({
                    success: true
                })
            }
            else{
                return res.status(400).json({
                    success: false
                })
            }
        }
        catch(err){
            res.status(500).json({
                success: false,
                msg: err
            })
        }
    });

router.route('/mydream/delete/:_id').patch(
    async(req, res) => {
        const id = req.params._id;
        try{
            const clearDream = await BulkBreaker.updateOne({_id: id}, 
                {$unset: {mydream: 1, points: 1}
                })
                res.send('Dream Cleared')
        }catch(err){
            res.status(500).json({
                success: false,
                msg: 'Dream not cleared'
            })
        }
    }
)

router.route('/push-notification').post(
    async(req, res)=> {
         // push notification
        await Subscription.find({ID: req.body.userId}).then(data => {
          
          if(data.length > 0) {
            const subscription = { 
              "endpoint": data[0].endpoint,
              "expirationTime": null,
              "keys": {
                "p256dh": data[0].p256dh,
                "auth": data[0].auth
              }
            }; 
  
            const payload = JSON.stringify({
              title: 'IBShopNow',
              body: req.body.message,
            });

            webpush.sendNotification(subscription, payload)
              .then(result => console.log(result))
              .catch(e => console.log(e.stack));
          }  

          return res.send("Sent");
        });
    }
)


module.exports = router;