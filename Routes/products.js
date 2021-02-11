const express = require('express');
const router = express.Router();

const Product = require('../Models/Poducts');

router.route('/') 
    .post(async (req, res) => {
        const { brand, sku, volume, image} = req.body;
        try{

            let product = await Product.create()

            product = new Product({
                brand,
                sku,
                volume,
                image,
            });
           await product.save();

           res.json(product);
        }
        catch(err){
            res.status(500).send({success: false, err})
        }
    })

    .get(async (req, res) => {
        try{

            const product = await Product.find();
            res.json(product);
        }
        catch(err){
             
        }
    });

router.route('/:_id')
    .patch(async (req, res) => {
        try{
        
            const product = await Product.updateOne(
                {_id: req.params._id},
                {$set: {recommendedPrice: req.body.recommendedPrice}}
            );
            res.json(product);
        }
        catch(err){
            res.status(500).send({success: false, err: 'Can not update'})
        }
    });

router.route('/softdrinks').get(async(req, res) =>{
    try{
        const products = await Product.find({recommendedPrice: null});
        res.json(products)
    }catch(err){
        res.status(500).json(err)
    }
})

module.exports = router;