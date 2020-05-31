const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

const Poc = require('../Models/POC');

router.route('/')
    .get(async (req, res) => {
        try{

            const poc = await Poc.find();
            res.json(poc)
        }
        catch(err){
            res.status(500).send({success: false, err})
        }
    })

    .post( 
        [
        check('code', 'Enter your Unique Code').not().isEmpty(),
        check('password', 'Pin must be 8 selections').isLength({min: 8})

        ], async (req, res) => {
        
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({errors: errors.array()});
        }
        const { ID, password } = req.body;

        try{

            const poc = await Poc.findOne({ID});

            if(!poc){
                return res.status(404).send({success: false, message: 'POC not found, Kindly contact the CIC team'})
            }

            const salt = await bcrypt.genSalt(10);
            poc.password = await bcrypt.hash(password, salt);

            await poc.save()
        }
        catch(err){
            res.status(500).send({success: false, err})
        }
    });

    router.route('/:_id')
        .patch(async (req, res) => {

            try{

                const poc = await Poc.update(
                   { _id: req.params._id},
                   {$set: req.body}
                );
                await poc.save()
            }
            catch(err){
                res.status(500).send({ success: false, err})
            }
        })

    module.exports = router;