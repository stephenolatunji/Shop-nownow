const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');


const BulkBreaker = require('../Models/BulkBreaker');

router.route('/')
    .get(async (req, res) => {
        try{

            const bulkBreaker = await BulkBreaker.find();
            res.json(bulkBreaker);

        }
        catch(err){
            res.status(500).send({success: false, err})
        }
    })

    .post(
        [
            check('ID', 'Enter your Unique Code').not().isEmpty(),
            check('password', 'Pin must be 8 selections')

        ], async (req, res) =>{

        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({errors: errors.array()})
        }

        const {ID, password } = req.body;

        try{

            const bulkBreaker = await BulkBreaker.find({ ID })

            if(!bulkBreaker){
                return res.status(400).send('Invalid Credential')
            }

            const salt = await bcrypt.genSalt(10);
            bulkBreaker.password = await bcrypt.hash(password, salt);
            await bulkBreaker.save()
        }
        catch(err){
            res.status(500).send({success: false, err})
        }
    });

    module.exports = router