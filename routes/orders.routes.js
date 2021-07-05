const {Order} = require('../models/order.schema');
const {OrderItem} = require('../models/order-item.schema');
const express = require('express');
const router = express.Router();

router.get(`/`, async (req, res) =>{
    const orderList = await Order.find().populate('user', 'name').sort({'dateOrdered': -1}); // Sort es para que muestre los ultimos registros de primero

    if(!orderList) {
        res.status(500).json({success: false})
    }
    res.send(orderList);
});

router.get(`/:id`, async (req, res) =>{
    const order = await Order.findById(req.params.id)
    .populate('user', 'name') // Muestra los campos de UserCollection
    .populate(
    {
        path: 'orderItems', populate: 
        {
            path: 'product', 
            populate: 'category'
        }
    });

    if(!order) {
        res.status(500).json({success: false})
    }
    res.send(order);
});

router.post('/', async (req, res) => {
    const orderItemsIds = Promise.all(req.body.orderItems.map(async orderItem => {
        let newOrderItem = new OrderItem({
            quantity: orderItem.quantity,
            product: orderItem.product,
        });
        newOrderItem = await newOrderItem.save();

        return newOrderItem._id; // regresa todos los Ids es importante el arreglo de promesas
    }));

    const orderItemsIdsResolved = await orderItemsIds; // espera los ids de la orderItems

    let order = new Order({
        orderItems: orderItemsIdsResolved,
        shippingAddress1: req.body.shippingAddress1,
        shippingAddress2: req.body.shippingAddress2,
        city: req.body.city,
        zip: req.body.zip,
        country: req.body.country,
        phone: req.body.phone,
        status: req.body.status,
        totalPrice: req.body.totalPrice,
        user: req.body.user
    });

    order = await order.save(); // order completa

    if(!order){
        res.status(400).send('the order cannot be created');
    }

    res.send(order);
});

module.exports =router;