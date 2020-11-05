const express = require("express");
require('dotenv').config();
const router = express.Router();
const Subscription = require("../Models/Subscription");

router.route('/save-subscription/:ID')

    .get(async (req, res) => {
        try{
            const subscription = await Subscription.find()
            .lean();
            res.json(subscription);
        }
        catch(err){
            console.log(err);
            res.status(500).send({success: false, err})
        }
    })

    .post(async(req, res) =>{
        try{

            const sub = await Subscription.find({ID: req.params.ID});

            if(sub.length!==0) {
                await Subscription.updateOne(
                    { ID: req.params.ID },
                    { $set: { endpoint: req.body.endpoint, p256dh: req.body.keys.p256dh, auth: req.body.keys.auth } }
                );
            }
            else {              
                let subscription = new Subscription({
                    ID: req.params.ID,
                    endpoint: req.body.endpoint,
                    p256dh: req.body.keys.p256dh,
                    auth: req.body.keys.auth
                });
                await subscription.save();
            };

            res.status(200).send({
                success: true
            });
        }
        
        catch(err){
            res.status(500).send({
                success: false,
                Error: err
            })
        }
    });

module.exports = router;