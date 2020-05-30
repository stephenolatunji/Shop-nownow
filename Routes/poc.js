const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

const POC = require('../Models/POC');

router.route('/')
    .get(async (req, res) => {
        try{

            const poc = await POC.find({location: req.params.location});
            res.json(poc)
        }
        catch(err){
            res.status(500).send({success: false, err})
        }
    })
router.route('/register')
    .post( async (req, res) => {
        
        const { ID, password } = req.body;

        try{

            const poc = await POC.findOne({ID});

            if(!poc){
                return res.status(404).send({success: false, message: 'POC not found, Kindly contact the CIC team'})
            }
            const salt = await bcrypt.genSalt(10);
            poc.password = await bcrypt.hash(password, salt);

            const payload = {
                user: {
                    id: poc._id
                }
            }

            jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: 3600
            }, (err, token) => {
                if(err){
                    throw error
                }
                res.json({poc, token})
            })
        }
        catch(err){
            res.status(500).send({success: false, err})
        }
    });

    router.route('/:_id')
        .patch(async (req, res) => {

            try{

                const poc = await POC.update(
                   { _id: req.params._id},
                   {$set: req.body}
                );
                res.json(poc)
            }
            catch(err){
                res.status(500).send({ success: false, err})
            }
        })

    module.exports = router;