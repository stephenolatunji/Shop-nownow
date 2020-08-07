const express = require('express');
const router = express.Router();
require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Admin = require('../Models/Admin');

router.route('/')
    .post(async (req, res) =>{
        const { email, password } = req.body;

        try{
            const admin = new Admin({
                email,
                password
            });
            
        }
        catch(err){
            res.status(500).json({
                success: false,
                Error: err
            })
        }
    })


module.exports = router;