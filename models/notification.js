const Joi = require('joi');
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  Title:{
      type:String,
      required:true
  },
  body:{
      type:String,
      required:true
  },
  data:{
      type:Object
  },
  createdAt:{
      type:Date,
      default:new Date()
  },
  Type:{
      type:String,
      enum:['Document','Query', 'Article','General'],
      required:true
  },
  SentTo:{
      type:String,
  }
});

const Notification = mongoose.model('Notification', notificationSchema);

function validateNotification(data){
    const schema = {
       Title:Joi.string().required(),
       body:Joi.string().required(),
       data:Joi.object(),
       Type:Joi.string(),
       SentTo:Joi.string()
    }
    return Joi.validate(data, schema);
}

exports.Notification = Notification;
exports.validate = validateNotification;