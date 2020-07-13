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
            res.json(bulkBreaker);
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
    
        try{
            const salt = await bcrypt.genSalt(10);
            const hashed = await bcrypt.hash(password, salt);

            const bulkbreaker = await BulkBreaker.updateOne(
                {_id: req.params._id},
                {$set: {password: hashed, 
                        activated: req.body.activated
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

}


module.exports = router;