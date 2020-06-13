const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Poc = require('../Models/Pocs');


router.route('/')
    .get(async (req, res) => {
        try{
            const poc = await Poc.find().lean();
            res.json(poc);
        }
        catch(err){
            console.log(err);
            res.status(500).send({success: false, err})
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

                const poc = await Poc.findOne({ID, password});
                
                if(!poc){
                    return res.status(401).send({success: false, msg: 'Unauthorized User'})
                }

                // const isMatch = await bcrypt.compare(password, poc.password);

                // if(!isMatch){
                //     return res.status(400).send({
                //     message: 'Invalid credential',
                //     success: false
                //     })
                // }

                // const payload = {
                //     user: {
                //         id: poc._id
                //     }
                // };

                // jwt.sign(payload, process.env.JWT_SECRET, {
                //     expiresIn: 3600
                // }, async (err, token) => {
                //     if(err){
                //         return res.status(500).send({
                //             success: false,
                //             message: 'Invalid creditial'
                //         })
                //     }
                    res.json({
                        success: true,
                        poc
                        // token
                    });
                // });
            }
            catch(err){
                res.status(500).send({sucess: false, err})
            }
    });

router.route('/:_id')
    .patch(async (req, res) => {

        try{

            const poc = await Poc.updateOne(
                { _id: req.params._id},
                {$set: req.body}
            );
            res.json(poc);
        }
        catch(err){
            res.status(500).send({ success: false, err})
        }
    })
    
    .get(async (req, res) => {
        
        try{

            const poc = await Poc.findById({_id: req.params._id});
            res.json(poc)
        }
        catch(err){
            res.status(500).send('Sever Error')
        }
    });

    router.route('/changepassword/:_id')
    .patch(async (req, res) => {
        try{
            const poc = await Poc.updateOne(
                {_id: req.params._id},
                {$set: {password: req.body.password}}
            )
            // const salt = await bcrypt.genSalt(10);
            // poc.password = await bcrypt.hash(password, salt);

            res.status(200).json({
                success: true,
                poc
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

            const poc = await Poc.find({ ID: req.params.ID});
            res.json(poc);
        }
        catch(err){
            res.status(500).send({
                success: false,
                err
            })
        }
});

module.exports = router;