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
            check('ID', 'Enter your Unique ID').not().isEmpty(),
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


router.route('/login')
    .post(
        [
            check('ID', 'Enter your Unique ID').not().isEmpty(),
            check('password', 'Pin must be 8 selection').isLength({min: 8})

        ],
        async (req, res) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(400).json({errors: errors.array()});
            }
            const {ID, password } = req.body;

            try{

                const bulkBreaker = await BulkBreaker.findOne({ID});
                
                if(!bulkBreaker){
                    return res.status(401).send({success: false, msg: 'Unauthorized User'})
                }

                const isMatch = await bcrypt.compare(password, bulkBreaker.password);

                if (!isMatch) {
                    return res.status(400).json({message: 'Invalid pin', success: false});
                }

                const payload = {
                    user: {
                        id: bulkBreaker._id
                    },
                };

                jwt.sign(payload, process.env.JWT_SECRET, {
                    expiresIn: 3600
                }, (err, token) => {
                    if(err){
                        return res.status(500).send({success: false,});
                    }
                    res.json({ success: true, token, bulkBreaker });
                });
            }
            catch(err){
                res.status(500).send({sucess: false, err})
            }
    });


    module.exports = router