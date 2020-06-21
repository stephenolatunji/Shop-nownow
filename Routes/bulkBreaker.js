const express = require('express');
const router = express.Router();
require('dotenv').config();
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


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

                const bulkBreaker = await BulkBreaker.findOne({ID, password});
                
                if(!bulkBreaker){
                    return res.status(401).send({success: false, msg: 'Unauthorized User'})
                }

                // const isMatch = await bcrypt.compare(password, bulkBreaker.password)

                // if(!isMatch){
                //     return res.status(400).send({
                //         success: false,
                //         message: 'Invalid credential'
                //     })
                // }

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
                    res.json({
                        success: true,
                        bulkBreaker,
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
    .patch(
        // [
        //     check('password', 'Please enter a password at least 8 character and contain At least one uppercase.At least one lower case.At least one special character.')
        //     .isLength({min: 8})
        //     .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/, "i")
        // ],
            async (req, res) => {
                // const errors = validationResult(req);
                // if (!errors.isEmpty()) {
                //     res.status(400).json({errors: errors.array()});
                // }
        try{
            const bulkbreaker = await BulkBreaker.updateOne(
                {_id: req.params._id},
                {$set: {password: req.body.password}}
            );

            // const salt = await bcrypt.genSalt(10);
            // bulkBreaker.password = await bcrypt.hash(password, salt);

            res.status(200).json({
                success: true,
                bulkbreaker
            });
        }
        catch(err){
            res.status(500).send({
                sucess: false,
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

module.exports = router;