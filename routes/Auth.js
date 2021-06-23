//This router hanles request for new users
const Joi = require('joi');
const bcrypt = require('bcrypt');
const { User } = require('../models/user');
const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
   //Validate request body
   const { error } = validate(req);
   if (error) return res.status(400).send(error.details[0].message);
  
   const user = await User.findOne({ emailAddress: req.body.emailAddress });
   if(!user) return res.status(400).send('Invalid Email ');
   if(user.SigninMethod != 'EMAIL') return res.status(400).send('Invalid User');
   
   const validPassword = await bcrypt.compare(req.body.password, user.password);
   if(!validPassword) return res.status(400).send('Invalid Password');
 
   const token= user.generateAuthToken();
   res.status(200).send(token);
});

function validate(req){
    const schema = {
        emailAddress: Joi.string().min(5).max(255).required().email(),
        password: Joi.string().min(5).max(255).required()
    };

    return Joi.validate(req.body, schema);
     
}


module.exports = router; 