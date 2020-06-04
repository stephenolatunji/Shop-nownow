const express = require('express');
const router = express.Router();

const Order = require('../Models/Order');
const Product = require('../Models/Poducts');
const Item = require('../Models/Items')
const Distributor = require('../Models/Distributor');
const Bulkbreaker = require('../Models/BulkBreaker');
const Poc = require('../Models/Poc');

router.route('/')
    .post( async (req, res) => {

        const { pocId, bulkBreakerId, distributorId, items, product, quantity } = req.body;

        const totalAmount = items.reduce((currentTotal,{ price, quantity}) => currentTotal +( price * quantity), 0)

        try{
            let user
            let order;

            user = await Order.findById(ID)
            if(bulkBreakerId){
                order = await Order.findOne(bulkBreakerId);
                if(!order){
                    return res.status(404).send('Not Found')
                }
                order = await Order.findOne({bulkBreakerId: bulkBreakerId});
            }
            user = await Poc.findById(pocId);
            if(!user){
                res.status(404).send('Not Found')
            }
            order = await Order.findOne({pocId: pocId});


           if(order){
               let itemIndex = order.items.product.findIndex(p => p.productId == productId);

               if(itemIndex > -1) {
                   let productItem = order.items[itemIndex];
                   productItem.quantity = quantity;
                   order.items.product[itemIndex] = productItem
               }
               else{
                   order.items.push(product, quantity, totalAmount);
               }
               order = await Order.save()
               res.json(order);
           }
           else{
               let newOrder;
               if(pocId){
                    newOrder = await Order.create({
                        pocId,
                        items: [ totalAmount, product, bulkBreakerId||distributorId]
                    })
               }
               newOrder = await Order.create({
                   bulkBreakerId,
                   items: [totalAmount, product, distributorId]
               });
               return res.json(newOrder);
           }

        }
        catch(err){
            res.status(500).send({sucess: false, err})
        }
    })
    .get(async (req, res) => {
        try{

            let order;

            if(distributor){
                order = await Order.findById(distributorId)
            }
            order = await Order.findById(bulkBreakerId)
            
        }
        catch(err){
            res.status(500).send("Server Error")
        }
    });

    router.route('/:_id')
        .patch((req, res) => {
            try{
                const order = await Order.updateOne(
                    {_id: req.params._id},
                    {$set: {status: req.body.status}}
                )
                if(status.confirmed == !true){
                    return status.processing = true
                }
                res.json(status)
            }
            catch(err){
                res.status(500).json(err)
            }
        })
        module.exports = router;