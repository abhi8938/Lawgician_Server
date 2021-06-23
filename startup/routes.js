// const error = require('../middleWare/error');
const express = require('express');
const users = require('../routes/Users');
const auth = require('../routes/Auth');
const articles = require('../routes/Articles');
const documents = require('../routes/Documents');
const orders = require('../routes/Orders');
module.exports = function(app) {
    app.use(express.json());
    app.use('/api/users', users);
    app.use('/api/auth', auth);
    app.use('/api/articles', articles);
    app.use('/api/documents',documents);
    app.use('/api/orders',orders)
    
}