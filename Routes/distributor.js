const express = require('express');
const router = express.Router();
const {check, validationResult } = require('express-validator');
require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const request = require('request');

const Distributor = require('../Models/Distributor');
const { response } = require('express');

router.route('/')
    .get(async (req, res) => {
        try{
            const distributor = await Distributor.find()
            .select('-password')
            .lean()
            res.json(distributor)
        }
        catch(err){
            res.status(500).send({success: false, msg: 'Server Error'})
        }
    })

    .post(async(req, res) =>{
        const { ID, name, latitude, longitude} = req.body;
        try{


          let  distributor = new Distributor({
              ID,
              name,
              latitude,
              longitude
          });

          await distributor.save();
          res.json(distributor);
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
            // check('password', 'invalid password').exists()

        ],
        async (req, res) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(400).json({errors: errors.array()});
            }
            const {ID, password } = req.body;

            try{

                const distributor = await Distributor.findOne({ID, password});
                
                if(!distributor){
                    return res.status(401).send({success: false, msg: 'Unauthorized User'})
                }

                // const isMatch = await bcrypt.compare(password, distributor.password);

                // if(!isMatch){
                //     return res.status(400).send({
                //     success: false,
                //     message: 'Invalid credential'
                // })
                // }
                  
                // const payload = {
                //     user: {
                //         id: distributor._id
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
                    distributor,
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

            const distributor = await Distributor.updateOne(
                { _id: req.params._id},
                {$set: req.body}
            );
            res.json(distributor);
        }
        catch(err){
            res.status(500).send({ success: false, err})
        }
    })

    .get(async (req, res) => {
        
        try{

            const distributor = await Distributor.findById({_id: req.params._id}, '-password').lean();
            res.json(distributor)
        }
        catch(err){
            res.status(500).send('Sever Error')
        }
    });

router.route('/changepassword/:_id')
    .patch(async (req, res) => {
          
        try{
            const distributor = await Distributor.updateOne(
                {_id: req.params._id},
                {$set: {password: req.body.password}}
            );

            // const salt = await bcrypt.genSalt(10);
            // distributor.password = await bcrypt.hash(password, salt);


        //     const payload = {
        //         user: {
        //             id: distributor._id
        //         }
        //     };

        //     jwt.sign(payload, process.env.JWT_SECRET, {
        //         expiresIn: 3600
        //     }, async (err, token) => {
        //         if(err){
        //             return res.status(500).send({
        //                 success: false,
        //                 message: 'Invalid creditial'
        //             })
        //         }
        //     res.json({
        //         success: true,
        //         distributor,
        //         token
        //     });
        // });
        // }
        // catch(err){
        //     res.status(500).send({sucess: false, err})
        // }

            res.status(200).json({
                success: true,
                distributor
            });
        }
        catch(err){
            console.log(err)
            res.status(500).send({
                sucess: false,
                err
            })
        }

    });

router.route('/User/:ID')
    .get(async (req, res) => {
        try{

            const distributor = await Distributor.find({ ID: req.params.ID}, '-password').lean();
            res.json(distributor);
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
                const distributor = await Distributor.updateOne(
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