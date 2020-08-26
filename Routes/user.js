const express = require('express');
const router = express.Router();
require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {check, validationResult } = require('express-validator');

const User = require('../Models/User');
const { get } = require('request');

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
                res.status(400).json({ message: errors.array(), success: false});
            }
            const { firstname, lastname, email, password, address, city, state, phone } = req.body;
            console.log(req.body);
            try{

                let user = await User.findOne({email});
                if(user){
                    return res.status(400).json('User Already Exists')
                }
                user = new User({
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
                user.password = await bcrypt.hash(password, salt);

                await user.save();


                const payload = {
                    user: {
                        id: user._id
                    }
                };

                // const now = Math.floor(Date.now() / 1000),
                //     iat = (now - 10),
                //     jwtId = Math.random().toString(36).substring(7);

                // const payload = {
                //     iat: iat,
                //     jwtid: jwtId,
                // };

                jwt.sign(payload, process.env.JWT_SECRET, {
                    expiresIn: 3600
                }, (err, token) => {
                    if (err) {
                        return res.status(400).send({ success: false, message: 'JWT ERROR' });
                    }
                    res.json({ token, user, success: true });
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

            const user = await User.find().select('-password').lean();
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
    });

router.route('/login')
    .post(
        [
            check('password', 'Please enter a password with eight or more character').isLength({ min: 8 }),
            check('email', 'Enter a valid email').isEmail() 
        ], async(req, res) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(400).json({ message: errors.array(), success: false });
            }
            const { email, password } = req.body;

            try{
                let user = await User.findOne({email});
                if(!user){
                    return res.status(404).json({
                        success: false,
                        message: 'User not Found'
                    })
                }
                const isMatch = await bcrypt.compare(password, user.password);
                if (!isMatch) {
                    return res.status(404).send('Invalid Credentials')
                }
                else {

                    const payload = {
                        user: {
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
    })
module.exports = router;


