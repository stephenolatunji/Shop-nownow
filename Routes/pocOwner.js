const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

const PocOwner = require('../Models/Poco');

router.route('/')
    .post(async (req, res) => {

        const { ID, password} = req.body;
        try{
            const owner = await PocOwner.findOne({ID});
            if(!owner){
                return res.status(404).send('Owner not found')
            }

            const salt = await bcrypt.genSalt(10);
            poc.password = await bcrypt.hash(password, salt);

            await owner.save()

            res.json(owner)
        }
        catch(err){
            res.status(500).send({success: false, err})
        }
    });

    module.exports = router;