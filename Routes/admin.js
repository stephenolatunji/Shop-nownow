const express = require('express');
const router = express.Router();
require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../Middleware/auth')


const Admin = require('../Models/Admin');
const Order = require('../Models/Order')

router.route('/')
    .post(async (req, res) =>{
        const { email, password } = req.body;

        try{
            let admin = await Admin.findOne({email});
            if(admin ){
                return res.status(400).json({
                    success: false,
                    msg: 'Already exists'
                });
            }
            admin = new Admin({
            email,
            password
            });

            const salt = await bcrypt.genSalt(10);
            admin.password = await bcrypt.hash(password, salt);
            
            await admin.save();

            const payload = {
                    user: {
                        id: admin._id
                    }
                };
                jwt.sign(payload, process.env.JWT_SECRET, {
                    expiresIn: 3600,
                }, async (err, token) => {
                    if(err){
                        return res.status(500).send({
                            success: false,
                            message: 'Error Validating'
                        })
                    }
                    res.json({
                        success: true,
                        token
                    });
                });
        }
        catch(err){
            res.status(500).json({
                success: false,
                Error: "Can not register"
            })
        }
    });

router.route('/login')
    .post(async (req, res) => {
        const { email, password } = req.body;

        try{
            const admin = await Admin.findOne({email});
            if(!admin){
                return res.status(404).send('Thank you')
            }
            const isMatch = await bcrypt.compare(password, admin.password);
            if(!isMatch){
                return res.status(404).send('Invalid Credentials')
            }
            else{

                const payload = {
                    user: {
                        id: admin._id
                    }
                };
                jwt.sign(payload, process.env.JWT_SECRET, {
                    expiresIn: 3600,
                }, async (err, token) => {
                    if(err){
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
                Error: err
            })
        }
    });

router.route('/Order')
    .get( async (req, res) => {
        try {
            const orders = await Order.find().lean();
            res.json({
                success: true,
                orders
            })
        }
        catch (err) {
            res.status(500).json({
                success: false,
                Error: err
            })
        }
    });

module.exports = router;