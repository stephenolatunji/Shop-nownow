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
            const distributor = await Distributor.find().select('name phone whatsapp longitude latitude').lean()
            res.json(distributor)
        }
        catch(err){
            res.status(500).send({success: false, msg: 'Server Error'})
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
                    res.json({ success: true, distributor });
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

            const distributor = await Distributor.findById({_id: req.params._id}, 'name longitude latitude phone');
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

            res.status(200).json({
                success: true,
                distributor
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

            const distributor = await Distributor.find({ ID: req.params.ID}, 'name phone longitude latitude');
            res.json(distributor);
        }
        catch(err){
            res.status(500).send({
                success: false,
                err
            })
        }
});

module.exports = router;