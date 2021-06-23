//This router hanles request for new users
const bcrypt = require('bcrypt');
const auth = require('../middleware/auth');
const _ = require('lodash');
const { User, validate, validateUserSocial } = require('../models/user')
const { Notification } = require('../models/notification');
const express = require('express');
const router = express.Router();

router.get('/notification', async (req, res, next) => {
  const notifications = await Notification.find({ SentTo: req.headers.customerid }).sort({ CreatedAt: -1 }).limit(20);
  res.send(notifications);
});

router.get('/name/:customerId', async (req, res) => {
  const name = await User.findOne({ customerId: req.params.customerId });
  if (!name) return res.status(400).send('not found');
  console.log(name);
  res.status(200).send(name.fullName);
})

router.get('/me', auth, async (req, res, next) => {
  const user = await User.findById(req.user._id).select('-password');
  res.send(user);
});

// route to check if user exists and return user
router.get('/', async (req, res, ) => {

  // let user = await User.find().or({ emailAddress: req.headers.emailaurmobile }).or({ mobileNumber:req.headers.emailaurmobile }).select('-password');
  let user = await User.findOne({ emailAddress: req.headers.emailaddress })
  if (!user) return res.status(400).send('NEW_USER');
  const token = user.generateAuthToken();
  res.status(200).send(token);
});
router.get('/userdata', async (req, res, ) => {

  let user = await User.find().or({ emailAddress: req.headers.emailaurmobile }).or({ mobileNumber: req.headers.emailaurmobile }).select('-password');
  if (!user) return res.status(400).send('No user');
  res.status(200).send(user);
});
router.post('/', async (req, res) => {
  let count;
  await User.estimatedDocumentCount({}, (error, size) => {
    if (error) return res.status(400).send('customer id not generated please try again');
    count = size + 1;
    return count;
  });
  const { error } = validate(req);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ emailAddress: req.body.emailAddress });
  if (user) return res.status(400).send('emailAddress already exist');

  user = await User.findOne({ mobileNumber: req.body.mobileNumber });
  if (user) return res.status(400).send('mobileNumber already exist');

  if (count == undefined) return res.status(400).send('Server Error, Plese Try Again');
  user = new User(adduser(req, count));

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  await user.save()
    .then(() => {
      const token = user.generateAuthToken();
      res.status(200).send(token);
    })
    .catch((error) => {
      console.log(error);
      res.status(400).send('Oops! try again');
    })

});

// route to add notification token
router.put('/notify', async (req, res) => {
  const user = await User.findOne({ customerId: req.body.customerId });
  if (!user) return res.status(404).send('the user with given id is not available');
  user.Token = req.body.Token
  await user.save().catch(err => console.log(`err`, err.message));
  res.status(200).send('ADDED');
})

//route to add profession
router.put('/profession', async (req, res) => {
  console.log(`req`, req.body);
  const user = await User.findOne({ customerId: req.body.customerId })
  if (!user) return res.status(404).send('the user with given id is not available');
  user.Profession = req.body.Profession;
  await user.save();
  res.status(200).send('Registration Successful');
})

//route to add Address
router.put('/address', async (req, res) => {
  console.log(`req`, req.body);
  const user = await User.findOne({ customerId: req.body.customerId })
  if (!user) return res.status(404).send('the user with given id is not available');
  user.Address = req.body.Address;
  await user.save();
  res.status(200).send('Added Successfully');
})

// create put route handler to update firstName, lastName, mobileNumber
router.put('/details', async (req, res) => {
  const user = await User.findOne({ customerId: req.body.customerId });
  if (!user) return;
  // const { error } = validateMobile(req);
  // if (error) return res.status(400).send(error.details[0].message);

  if (req.body.firstName != '') {
    const updatedFirstName = req.body.firstName;
    user.firstName = updatedFirstName;
  }
  if (req.body.lastName != '') {
    const updatedLastName = req.body.lastName;
    user.lastName = updatedLastName;
  }

  if (req.body.mobileNumber != '') {

    const updatedMobileNumber = req.body.mobileNumber;
    user.mobileNumber = updatedMobileNumber;
  }
  await user.save();
  res.send('Update Successfull');

});

// create put route handler to update password
router.put('/password', async (req, res) => {
  const user = await User.findOne({ customerId: req.body.customerId });
  if (!user) return res.status(404).json('no user exists in db to update');;
  if (user.SigninMethod != 'EMAIL') return res.status(404).send('Not Logged in with email/password');

  const { error } = validatePassword(req);
  if (error) return res.status(400).send(error.details[0].message);

  const validPassword = await bcrypt.compare(req.body.oldPassword, user.password);
  if (!validPassword) return res.status(400).send('Invalid Original Password');

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(req.body.newPassword, salt);
  await user.save();
  res.send('Password Updated');
});

//create forgotPasswordReset handler
router.put('/resetPassword', async (req, res) => {
  const salt = await bcrypt.genSalt(10);
  const user = await User.findOne({ userName: req.body.userName });
  const { error } = validateResetPassword(req);
  if (error) return res.status(400).send(error.details[0].message);
  if (!user) {
    return res.status(404).json('no user exists in db to update');
  } else if (user) {
    return bcrypt.hash(req.body.password, salt)
      .then(newPassword => {
        console.log(newPassword);
        user.password = newPassword;
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
      })
      .then(async () => {
        await user.save();
        res.status(200).send({ message: 'password updated' })
      });
  }
});

router.put('/profilePicture',async(req,res)=> {
  if(req.body.customerId == undefined) return res.status(304).send('CustomerId missing');
  if(req.body.profilePicture == undefined) return res.status(304).send('profile picture missing');
  const user = await User.findOne({ customerId: req.body.customerId });
  console.log(('req',user));
  if(!user) return res.status(400).send('No User Found');
  user.profilePicture = req.body.profilePicture
 await user.save();
  return res.status(200).send(user.profilePicture)
})

function adduser(req, count) {
  const addeduser = {
    //TODO: handlepost request
    fullName: req.body.fullName,
    emailAddress: req.body.emailAddress,
    mobileNumber: req.body.mobileNumber,
    password: req.body.password,
    customerId: 'CUST@00' + count,
    SigninMethod: req.body.SigninMethod
  };
  return addeduser;
}

module.exports = router; 