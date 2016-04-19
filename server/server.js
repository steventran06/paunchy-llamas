var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var errorHandler = require('express-error-handler');
var morgan = require('morgan');

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/codeLlama');

var app = express();
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json({limit: '5mb'}));
app.use(methodOverride()); 


//set up routes here from routes file
require('./routes')(app, express);

const port = process.env.PORT || 8000;

app.listen(port);

module.exports = app;



