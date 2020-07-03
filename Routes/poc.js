const express = require('express');
const router = express.Router();
require('dotenv').config();
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const request = require('request');

const Poc = require('../Models/Pocs');


router.route('/')
    .get(async (req, res) => {
        try{
            const poc = await Poc.find()
            .select('-password')
            .lean();
            res.json(poc);
        }
        catch(err){
            console.log(err);
            res.status(500).send({success: false, err})
        }
    })

    .post(async(req, res) =>{
        const { ID, name, latitude, longitude} = req.body;
        try{


          let  poc = new Poc({
              ID,
              name,
              latitude,
              longitude
          });

          await poc.save();
          res.json(poc)
        }
        catch(err){
            res.status(500).send({
                success: false,
                Error: err
            })
        }
    });
   
router.route('/login')
    .post(
        [
            check('ID', 'Enter your Unique ID').not().isEmpty(),

        ],
        async (req, res) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(400).json({errors: errors.array()});
            }
            const {ID, password } = req.body;

            try{

                const poc = await Poc.findOne({ID, password});
                
                if(!poc){
                    return res.status(401).send({success: false, msg: 'Unauthorized User'})
                }

                // const isMatch = await bcrypt.compare(password, poc.password);

                // if(!isMatch){
                //     return res.status(400).send({
                //     message: 'Invalid credential',
                //     success: false
                //     })
                // }

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
                    res.json({
                        success: true,
                        poc,
                    //     token
                    // });
                });
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
            res.json(poc);
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
        try{
            const poc = await Poc.updateOne(
                {_id: req.params._id},
                {$set: {password: req.body.password}}
            )
            // const salt = await bcrypt.genSalt(10);
            // poc.password = await bcrypt.hash(password, salt);

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
            const newPassword = Math.random().toString(36).substring(2).slice(4);
            const mobile = req.body.mobile;
            const ID = req.body.userId;
            
            try {
                const poc = await Poc.updateOne(
                    { ID: ID, phone: mobile },
                    { $set: {password: newPassword } }
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