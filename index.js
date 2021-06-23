const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
app.use(bodyParser.json());
app.use(methodOverride('_method'));
app.set('view engine','ejs');



app.use(cors());
require('./startup/logging');
require('./startup/routes')(app);
require('./startup/db')();
require('./startup/config');
require('./startup/prod')(app);



const port = process.env.PORT || 3001;
app.listen(port,() => console.log('Listening '+ port));