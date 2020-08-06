const express = require('express');
const router = express.Router();
require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const request = require('request');
const randomString = require('randomstring');

const BulkBreaker = require('../Models/BulkBreaker');

router.route('/')
    .get(async (req, res) => {
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

    .patch(async (req, res) => {
        try {
            const distributor = await Distributor.find()
                .select('-password')
                .lean();
            //const address = await Address.find().lean();

            for (let i = 950; i < distributor.length; i++) {
                const element = distributor[i].ID;
                //const address_new = address.filter(singleAddress => singleAddress.ID == element.ID);
                let address;

                const axios = require('axios');

                if (distributor[i].latitude !== 0 && distributor[i].longitude !== 0) {


                    axios.get(
                        "https://maps.googleapis.com/maps/api/geocode/json?address=" +
                        distributor[i].latitude +
                        "," +
                        distributor[i].longitude +
                        "&key=AIzaSyDP0uHnHq94o4rGjq0HzhIm6zJ8yA2bZ8A"
                    )
                        .then(response => {
                            address = response.data.results[0].formatted_address;
                            console.log(distributor[i].ID)

                        })
                        .catch(error => {
                            console.log(error);
                        });
                    setTimeout(async () => {
                        const d = await Distributor.updateOne(
                            { ID: distributor[i].ID },
                            {
                                $set: {
                                    address: address
                                }
                            });
                    }, 1500);
                }
            }

            res.send('Am done oo!!!');


        }
        catch (err) {
            res.status(500).send({ success: false, msg: 'Server Error' })
        }
    })

    .post(async(req, res) =>{
        const { ID, name, latitude, longitude} = req.body;
        try{

            // let bulkBreaker = await BulkBreaker.find();

          let bulkBreaker = new BulkBreaker({
              ID,
              name,
              latitude,
              longitude
          });

          await bulkBreaker.save();
          res.json(bulkBreaker)
        }
        catch(err){
            res.status(500).send({
                success: false,
                Error: err
            })
        }
    });

router.route('/login')
    .post(async (req, res) => {
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
                    res.json({
                        success: true,
                        bulkBreaker,
                        // token
                    });
                }

                // const payload = {
                //     user: {
                //         id: bulkBreaker._id
                //     }
                // };

                // jwt.sign(payload, process.env.JWT_SECRET, {
                //     expiresIn: 3600,
                // }, async (err, token) => {
                //     if(err){
                //         return res.status(500).send({
                //             success: false,
                //             message: 'Error Validating'
                //         })
                //     }
                //     res.json({
                //         success: true,
                //         bulkBreaker,
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

            const bulkBreaker = await BulkBreaker.updateOne(
            { _id: req.params._id},
            {$set: req.body}
            );
            const result = await BulkBreaker.findById({ _id: req.params._id }, '-password').lean();
            res.json(result);
        }
        catch(err){
            res.status(500).send({ success: false, err})
        }
    })

    .get(async (req, res) => {
        
        try{

            const bulkBreaker = await BulkBreaker.findById({_id: req.params._id}, '-password').lean();
            res.json(bulkBreaker)
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