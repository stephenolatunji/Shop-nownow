const express = require('express');
const router = express.Router();
const {check, validationResult } = require('express-validator');
require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


const Distributor = require('../Models/Distributor');

router.route('/')
    .get(async (req, res) => {
        try{
            const distributor = await Distributor.find()
            res.json(distributor)
        }
        catch(err){
            res.status(500).send({success: false, msg: 'Server Error'})
        }
    })

    // .post( 
    //     [
    //         check('ID', 'Enter your Unique ID').not().isEmpty(),
    //         check('password', 'Password must be 8 selections')

    //     ], async (req, res) => {
        
    //     const errors = validationResult(req);
    //     if (!errors.isEmpty()) {
    //         res.status(400).json({errors: errors.array()});
    //     }

    //     const {ID, password, name, longitude, latitude, payment, delivery, product } = req.body;

    //     try{

    //         let distributor = await Distributor.findOne({ ID });
    //         if(distributor){
    //             return res.status(404).send('Invalid Distributor')
    //         }

    //         distributor = new Distributor({
    //             ID,
    //             name,
    //             password,
    //             longitude,
    //             latitude,
    //             // payment,
    //             // delivery,
    //             // product,
    //         });
    //         const salt = await bcrypt.genSalt(10);
    //         distributor.password = await bcrypt.hash(password, salt);

    //         await distributor.save();

    //         res.json(distributor);
    //     }
    //     catch(err){
    //         res.status(500).send({success: false, err})
    //     }
    // });

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

                const distributor = await Distributor.findOne({ID, password});
                
                if(!distributor){
                    return res.status(401).send({success: false, msg: 'Unauthorized User'})
                }

                // const isMatch = await bcrypt.compare(password, distributor.password);

                // if (!isMatch) {
                //     return res.status(400).json({message: 'Invalid pin', success: false});
                // }

                // const payload = {
                //     user: {
                //         id: distributor._id
                //     },
                // };

                // jwt.sign(payload, process.env.JWT_SECRET, {
                //     expiresIn: 3600
                // }, (err, token) => {
                //     if(err){
                //         return res.status(500).send({success: false,});
                //     }

                if(!password){
                    return res.status(400).send('Invalid credential')
                }
                    res.json({ success: true, distributor });
                // });
            }
            catch(err){
                res.status(500).send({sucess: false, err})
            }
    });

router.route('/:_id')
    .patch(async (req, res) => {

        try{

            const distributor = await Distributor.update(
                { _id: req.params._id},
                {$set: req.body}
            );
            await distributor.save();
            res.json(distributor);
        }
        catch(err){
            res.status(500).send({ success: false, err})
        }
});

module.exports = router;