const auth = require('../middleware/auth');
const { Order, validate } = require('../models/order')
const express = require('express');
const router = express.Router();
const { sendNotification } = require('../services');

router.get('/', async(req,res)=>{
   //get orders for admin
   const orders = Order.find().sort({CreatedAt:-1});
   res.status(200).send(orders); 
})

router.get('/customer',async(req,res) => {
    //get orders for customer
    const orders = Order.find({CustomerId:req.headers.customerid}).sort({CreatedAt:-1});
    res.status(200).send(orders); 
})

router.post('/', async(req, res) =>{
 //create random orderId
 let order;
 let Id;
 do {
   Id = generateOrderId();
   order = await Order.findOne({ OrderId: Id });
   if (!order) generated = true;
 }
 while (generated == false);
 const { error } = validate(req);
  if (error) return res.status(400).send(error.details[0].message);
 //createOrder save in db
 order = new Order(addOrder(req, Id));
 try{
    order = await order.save();
    //check if order Paid then add transactionId to order
   if(order.PaymentStatus == 'PAID'){
       order.TransactionId = req.body.TransactionId
   }
   await sendNotification(order.CustomerId,{},`New Order! OrderId:${order.OrderId}`,`Generated Order for Service ${order.Service}`,'General')
 }catch(error){
  return res.status(304).send(error);
 }
 res.status(200).send('Order Successfully Created');
 //return response
})

router.put('/', async(req, res) =>{
    const order = Order.findOne({ OrderId:req.body.OrderId});
    if(!order) res.status(400).send('No Order Found');
    //Update payment status and transactionId
    if(order.PaymentStatus == 'PENDING' && order.TransactionId == undefined){
        order.PaymentStatus = 'PAID'
        order.TransactionId = req.body.TransactionId
        res.status(200).send('Payment Info Added');
        return
    }
    if(order.PaymentStatus == 'PAID' && order.TransactionId != undefined){
        res.status(304).send('Already Paid');
        return
    }
})

function generateOrderId() {
    return Math.random().toString(36).substr(2, 9);
  }

function addOrder(req, orderId){
    const addedOrder={
      //TODO: handlepost request
      CustomerId:req.body.CustomerId,
      Customer:req.body.Customer,
      Service:req.body.Service,
      Price:req.body.Price,
      OrderId:orderId,
      PaymentStatus:req.body.PaymentStatus
    };
    return addedOrder;
  }

  module.exports = router; 