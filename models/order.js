const Joi = require('joi');
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
   CreatedAt:{
       type:Date,
       default:new Date()
   },
   CustomerId:{
       type:String,
       required:true
   },
   Customer:{
       name:{type:String},
       email:{type:String},
       mobile:{type:String}
   },
   Service:{
       type:String,
       required:true
   },
   Price:{
       type:Number,
       required:true
   },
   OrderId:{
       type:String,
       required:true,
       unique:true
   },
   PaymentStatus:{
       type:String,
       enum:['PAID','PENDING'],
       required:true
   },
   TransactionId:{
       type:String
   }
});

const Order = mongoose.model('Orders', orderSchema);

function validateOrder(req){
    const schema = {
        Customer:Joi.object().required(),
        Service:Joi.string().required(),
        Price:Joi.number().required(),
        OrderId:Joi.string(),
        PaymentStatus:Joi.string().required(),
        TransactionId:Joi.string(),
        CustomerId: Joi.string()
    }
    return Joi.validate(req.body, schema);
}

exports.Order = Order;
exports.validate = validateOrder;