const mongoose = require('mongoose');

module.exports = function () {
        // mongoose.connect('mongodb+srv://abhishek8938:gotranks@cluster0-79cas.mongodb.net/test?retryWrites=true')
        // .then(() => console.log('connected to mongodb'))
        // .catch(err=> console.log('could not connect',err))
const mongoURI = 'mongodb://localhost/Lawgician';

       mongoose.connect(mongoURI)
        .then(() => console.log('connected to mongodb'))
        .catch(err=> console.log('could not connect',err))
 
}