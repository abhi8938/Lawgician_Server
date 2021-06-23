// this model contains schema and for single registered user
const jwt = require('jsonwebtoken');
const config = require('config');
const Joi = require('joi');
const mongoose = require('mongoose');

//create schema/blueprint for the document
const userSchema = new mongoose.Schema({
       
    fullName:{
        type: String,
        required:true,
        minlength:2
    },
    emailAddress:{
        type:String,
        required:true,
        minlength:5,
        unique:true
    },
    mobileNumber:{
        type:String,
        required:true,
        minlength:10,
        unique:true
    }, 
    password:{
        type:String,
        minlength:5,
        maxlength:1024
    },
    customerId:{
        type:String,
        unique:true
    },
    isAdmin:{
        type:Boolean,
        default:false
    },
    resetPasswordToken:{
        type:String,
        default:null
    },
    resetPasswordExpires:{
        type:Number,
        default:null
    },
    Address:{
        type:String,
    },
    Profession:{
        type:String
    },
    Token:{
        type:String
    },
    SigninMethod:{
        type:String,
        enum:['GOOGLE','FACEBOOK','EMAIL']
    },
    profilePicture:{
        type:String
    }
   
});

userSchema.methods.generateAuthToken = function(){
    const token = jwt.sign({ _id: this._id, isAdmin: this.isAdmin }, config.get('jwtPrivateKey'));
    return token;
}

//create model/class which takes argument Schema and collection in which it should be updated

const User = mongoose.model('Users', userSchema);

function validateUser(req){
    const schema = {
       fullName: Joi.string().min(2).required(),
       emailAddress: Joi.string().min(5).required().email(),
       mobileNumber: Joi.string().required().min(10).max(10),
       password: Joi.string().min(5).max(255).required(),
       customerId: Joi.string(),
       resetPasswordToken: Joi.string(),
       resetPasswordExpires: Joi.number(),
       Profession: Joi.string(),
       Token: Joi.string(),
       SigninMethod:Joi.string(),
       Address: Joi.string()
    };
    return Joi.validate(req.body, schema);  
}
function validateMobileNumber(req){
    const schema = {
       mobileNumber: Joi.string(),
       customerId: Joi.string().required(),
       firstName: Joi.string(),
       lastName: Joi.string()
    };

    return Joi.validate(req.body, schema);
     
}
function validatePasswordUpdate(req){
    const schema = {
       customerId: Joi.string().required(),
       oldPassword: Joi.string().required(),
       newPassword: Joi.string().min(5).max(255).required()
    };

    return Joi.validate(req.body, schema);
     
}
function validateResetPassword(req){
    const schema = {
       userName: Joi.string().required(),
       password: Joi.string().min(5).max(255).required()
    };

    return Joi.validate(req.body, schema);
     
}
function validateUserSocial(req){
    const schema = {
        fullName: Joi.string().min(2).required(),
        emailAddress: Joi.string().min(5).required().email(),
        mobileNumber: Joi.string().required().min(10).max(10),
        customerId: Joi.string(),
        SigninMethod:Joi.string()
    }
    return Joi.validate(req.body,schema);
}

exports.User = User;
exports.validate = validateUser;
exports.validateMobile = validateMobileNumber;
exports.validatePassword = validatePasswordUpdate;
exports.validateResetPassword = validateResetPassword;
exports.validateUserSocial = validateUserSocial;