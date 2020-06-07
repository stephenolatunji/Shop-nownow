const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');


const BulkBreaker = require('../Models/BulkBreaker');

router.route('/')
    .get(async (req, res) => {
        try{

            const bulkBreaker = await BulkBreaker.find().lean();
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

                if(!password){
                    return res.status(400).send('Invalid credential')
                }
                    res.json({ success: true, bulkBreaker });
            }
            catch(err){
                res.status(500).send({sucess: false, err})
            }
    });

router.route('/change-password')
    .post(async (req, res) => {

        const {ID, password} = req.body;

        try{

            const bulkBreaker = await BulkBreaker.findOne({ID});
            if(!bulkBreaker){
                return res.status(404).send('Not Found')
            }
             const salt = await bcrypt.genSalt(10);
             bulkBreaker.password = await bcrypt.hash(password, salt);

             await bulkBreaker.save();

             res.json(bulkBreaker)
        }
        catch(err){
            res.status(500).send('Server error')
        }
    })


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

            const bulkBreaker = await BulkBreaker.findById({_id: req.params._id}, 'name, longitude, latitude, phone');
            res.json(bulkBreaker)
        }
        catch(err){
            res.status(500).send('Sever Error')
        }
    });

    router.route('/changepassword/:_id')
    .patch(async (req, res) => {
        try{
            const bulkbreaker = await BulkBreaker.updateOne(
                {_id: req.params._id},
                {$set: {password: req.body.password}}
            ); 
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

router.route('/User/:ID')
    .get(async (req, res) => {
        try{

            const bulkBreaker = await BulkBreaker.find({ ID: req.params.ID});
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