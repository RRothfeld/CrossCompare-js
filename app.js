// modules
var express = require('express');
var app = express();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var path = require('path');
var favicon = require('serve-favicon');

// configuration
	
// config files
var port = process.env.PORT || 3000;
var db = require('./config/db');

// connect to our mongoDB database
connectionsubject = mongoose.createConnection(db.urlSubjectViews);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// parameters
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(express.static(__dirname + '/public'));
app.use(favicon(__dirname + '/public/favicon.ico'));

// routes
require('./app/routes')(app);

// start application
app.listen(port);	
exports = module.exports = app;