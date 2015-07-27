// modules
var express = require('express');
var app = express();
var path = require('path');
var logger = require('morgan');
// var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
	
// configuration
var port = process.env.PORT || 3000;

// connect to our mongoDB database(s)
// mongoConnection = mongoose.createConnection('mongodb://localhost:27017/MScProj');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// parameters
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(express.static(__dirname + '/public'));
app.use(logger('common'));

// routes
require('./routes/router')(app);

// Handle 404 and 500 error
app.use(function(req, res, next) {
		res.status(404 || 500).render('error');
});

// start application
app.listen(port);	
exports = module.exports = app;