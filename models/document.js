const Joi = require('joi');
const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  //TODO: create modal document
  CreatedAt:{
    type:Date,
    default: new Date()
  },
  SentTo:{
    type:String,
    required:true
  },
  From:{
    type:String,
    required:true
  },
  fileId:{
    type:String,
  },
  Note:{
    type:String,
    required:true
  },
  Type:{
    type:String,
  },
  CustomerName:{
    type:String,
    required:true
  },
  CustomerMobile:{
    type:String,
    required:true
  },
  CustomerEmail:{
    type:String,
    required:true
  }

});

const Document = mongoose.model('Documents', documentSchema);

function validateDocument(data){
    const schema = {
         CreatedAt:Joi.date(),
         SentTo:Joi.string().required(),
         From:Joi.string().required(),
         fileId:Joi.string(),
         Note:Joi.string().required(),
         Type:Joi.string(),
         ContentType:Joi.string(),
         CustomerName:Joi.string(),
         CustomerMobile:Joi.string(),
         CustomerEmail:Joi.string() 
    }
    return Joi.validate(data, schema);
}

exports.Document = Document;
exports.validate = validateDocument;