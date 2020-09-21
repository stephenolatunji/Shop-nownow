const express = require('express');
const router = express.Router();
require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {check, validationResult } = require('express-validator');

const Shopper = require('../Models/Shopper');
const Poc = require('../Models/Pocs');
const ShopperOrder = require('../Models/shopperOrder');


router.route('/')
    .post(
        [
            check('firstname', 'Enter firstname').not().isEmpty(),
            check('lastname', 'Enter lastname').not().isEmpty(),
            check('password', 'Please enter a password with eight or more character').isLength({ min: 8 }),
            check('email', 'Enter a valid email').isEmail()
        ], async(req, res) => {

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
               return res.status(400).json({ message: errors.array(), success: false});
            }
            const { firstname, lastname, email, password, address, city, state, phone } = req.body;
            console.log(req.body);
            try{

                let user = await User.findOne({email});
                if(user){
                    return res.status(400).send('User Already Exists')
                }
                user = new shopper({
                    firstname,
                    lastname,
                    address,
                    email,
                    password,
                    phone,
                    city,
                    state
                });

                const salt = await bcrypt.genSalt(10);
                shopper.password = await bcrypt.hash(password, salt);

                await shopper.save();


                const payload = {
                    shopper: {
                        id: shopper._id
                    }
                };

                jwt.sign(payload, process.env.JWT_SECRET, {
                    expiresIn: 3600
                }, (err, token) => {
                    if (err) {
                        return res.status(400).send({
                            success: false,
                            message: 'JWT ERROR' 
                        });
                    }
                    res.json({
                        token,
                        shopper,
                        success: true 
                    });
                });
            }
            catch(err){
                console.log(err)
                res.status(500).json({
                    success: false,
                })
            }

    })
    .get(async (req, res) => {
        try{
            const shopper = await shopper.find().select('-password').lean();
            res.status(200).json({
                success: true,
                shopper
            })
        }
        catch(err){
            res.status(500).json({
                success: false,
                err
            })
        }
    });

router.route('/login')
    .post(
        [
            check('password', 'Please enter a password with eight or more characters').isLength({ min: 8 }),
            check('email', 'Enter a valid email').isEmail() 
        ], async(req, res) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
               return res.status(400).json({
                   message: errors.array(),
                   success: false
                });
            }
            const { email, password } = req.body;

            try{
                let shopper = await Shopper.findOne({email});
                if(!shopper){
                    return res.status(404).json({
                        success: false,
                        message: 'shopper not Found'
                    })
                }
                const isMatch = await bcrypt.compare(password, shopper.password);
                if (!isMatch) {
                    return res.status(404).send('Invalid Credentials')
                }
                else {

                    const payload = {
                        shopper: {
                            id: user._id
                        }
                    };
                    jwt.sign(payload, process.env.JWT_SECRET, {
                        expiresIn: 3600,
                    }, async (err, token) => {
                        if (err) {
                            return res.status(500).send({
                                success: false,
                                message: 'Error Validating'
                            })
                        }
                        res.json({
                            success: true,
                            token,
                            msg: 'Logged In'
                        });
                    });
                }
            }
            catch(err){
                res.status(500).json({
                    success: false,
                    err
                })
            }
    });

router.route('/user/:id')
    .get(async(req, res) =>{
        try{
            const user = await Shopper.findOne({ _id: req.params._id }, '-password')
            .lean()
            if(!user){
                return res.status(404).send('User not Found')
            }
            res.status(200).json({
                success: true,
                user
            })
        }
        catch(err){
            res.status(500).json({
                success: false,
                err
            })
        }
    })

    .patch(async(req, res) => {
        try{

        }
        catch(err){
            try {
                const user = await User.updateOne(
                    { _id: req.params._id },
                    { $set: req.body }
                );
                const result = await User.findById({ _id: req.params._id }, '-password').lean();
                res.status(200).json({
                    success: true,
                    result,
                });
            } catch (err) {
                res.status(500).json({ success: false, error: err });
            }
        }
    });
module.exports = router;


