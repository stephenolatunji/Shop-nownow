const express = require('express');
const router = express.Router();
require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const request = require('request');
const randomString = require('randomstring');

const Poc = require('../Models/Pocs');
const Bdr =require('../Models/BDR');

// const Addre = require('../Models/addre')


router.route('/')
    .get(async (req, res) => {
        try{
            const poc = await Poc.find()
            .select('-password')
            .lean()
            .limit(100);
            res.json(poc);
        }
        catch(err){
            console.log(err);
            res.status(500).send({success: false, err})
        }
    })

    .patch(async (req, res) => {
        try {
            const bdr = await Bdr.find()
            .lean();
                const poc = await Poc.find()
                    .select('-password')
                    .lean();
                    
                    for (let i = 0; i < poc.length; i++) {
                        const element = poc[i].ID;
                        const dms_new = bdr.filter(singledms => singledms.ID == element);
                        
                        if(dms_new.length !== 0){
                            const d = await Poc.updateOne(
                                { ID: element },
                                {
                                    $set: {
                                        bdr: dms_new[0].bdr
                                    }
                                });
                        }
                        }
                        console.log(d);
    
        }
        catch (err) {
            res.status(500).send({ success: false, msg: 'Server Error' })
        }
    });
    

router.route('/login')
    .post(async (req, res) => {
            const {ID, password } = req.body;

            try{

                const poc = await Poc.findOne({ID});
                
                if(!poc){
                    return res.status(401).send({success: false, msg: 'Unauthorized User'})
                }

                const isMatch = await bcrypt.compare(password, poc.password);

                if(!isMatch){
                    return res.status(400).send({
                    message: 'Invalid credential',
                    success: false
                    })
                }
                else {
                    res.json({
                        success: true,
                        poc,
                        // token
                    });
                }

                // const payload = {
                //     user: {
                //         id: poc._id
                //     }
                // };

                // jwt.sign(payload, process.env.JWT_SECRET, {
                //     expiresIn: 3600
                // }, async (err, token) => {
                //     if(err){
                //         return res.status(500).send({
                //             success: false,
                //             message: 'Invalid creditial'
                //         })
                //     }
                //     res.json({
                //         success: true,
                //         poc,
                //         token
                //     });
                // });
            }
            catch(err){
                res.status(500).send({sucess: false, err})
            }
    });

router.route('/:_id')
    .patch(async (req, res) => {

        try{

            const poc = await Poc.updateOne(
                { _id: req.params._id},
                {$set: req.body}
            );
            const result = await Poc.findById({ _id: req.params._id }, '-password').lean();

            res.json(result);
        }
        catch(err){
            res.status(500).send({ success: false, err})
        }
    })
    
    .get(async (req, res) => {
        
        try{

            const poc = await Poc.findById({_id: req.params._id}, '-password').lean();
            res.json(poc)
        }
        catch(err){
            res.status(500).send('Sever Error')
        }
    });

    router.route('/changepassword/:_id')
    .patch(async (req, res) => {
        const password = req.body.password;
        const activated = true;
        
        try{
            const salt = await bcrypt.genSalt(10);
            const hashed = await bcrypt.hash(password, salt);

            const poc = await Poc.updateOne(
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
                poc
            });
        }
        catch(err){
            res.status(500).send({
                sucess: false,
                err
            })
        }

    });

router.route('/User/:ID')
    .get(async (req, res) => {
        try{

            const poc = await Poc.find({ ID: req.params.ID}, '-password').lean();
            res.json(poc);
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
                const poc = await Poc.updateOne(
                    { ID: ID, phone: mobile },
                    { $set: {password: hashed } }
                );
                // send sms
               sendSms(ID, mobile, newPassword);
               res.json({status: true})
            }
            catch(err){
                res.status(500).send('Sever Error')
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

        const rate = req.body.rating;

        try {
            let rateme = await Poc.findOne({ _id: req.params._id }).select('ratings');
            rateme = rateme.ratings;
            const rater = parseInt(rateme.rater + 1);

            const rating = parseFloat(rateme.rating) + parseInt(rate);

            const newRating = await Poc.updateOne(
                { _id: req.params._id },
                {
                    $set: {
                        ratings: {
                            rater: rater,
                            rating: rating,
                            star: rating / rater
                        }

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


module.exports = router;
