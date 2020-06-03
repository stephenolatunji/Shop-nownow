const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

const Poc = require('../Models/POC');

router.route('/')
    .get(async (req, res) => {
        try{
            const poc = await Poc.find();
            res.json(poc);
        }
        catch(err){
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

                if(!password){
                    return res.status(400).send('Invalid credential')
                }
                    res.json({ success: true, poc });
            }
            catch(err){
                res.status(500).send({sucess: false, err})
            }
    });

    router.route('/change-password')
    .post(async (req, res) => {

        const {ID, password} = req.body;

        try{

            const poc = await Poc.findOne({ID});
            if(!poc){
                return res.status(404).send('Not Found')
            }
             const salt = await bcrypt.genSalt(10);
             poc.password = await bcrypt.hash(password, salt);

             await poc.save();

             res.json(poc)
        }
        catch(err){
            res.status(500).send('Server error')
        }
    })



router.route('/:_id')
    .patch(async (req, res) => {

        try{

            const poc = await Poc.update(
                { _id: req.params._id},
                {$set: req.body}
            );
            await poc.save();
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

module.exports = router;