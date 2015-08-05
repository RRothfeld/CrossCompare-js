// Modules
var express = require('express');
var app = express();
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
	
// Configuration
var port = process.env.PORT || 80;

/* Uncomment database section to use mongoDB */
// // Connect to our mongoDB database(s)
// var mongoose = require('mongoose');
// mongoConnection = mongoose.createConnection('mongodb://localhost:27017/<insert name>');

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Parameters
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(express.static(__dirname + '/public'));
app.use(logger('common'));

// Routes
require('./routes/router')(app);

// Handle 404 and 500 error
app.use(function(req, res, next) {
	res.status(404 || 500).render('error');
});

// Start application
app.listen(port);	
exports = module.exports = app;