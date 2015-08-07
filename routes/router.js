/* Uncomment this section to use mongoDB */
// // MongoDB collections
// var collection = mongoConnection.model('', {}, '<insert collection name>');

/* Experiment section */
var fs = require('fs');

module.exports = function(app) {
	// GET home page
	app.get('/', function(req, res) {
		res.render('index');
	});

	// GET example page
	app.get('/example', function(req, res) {
		res.render('example');
	});

	// GET example page
	app.get('/tutorial', function(req, res) {
		res.render('tutorial');
	});

	// GET documentation page
	app.get('/docs', function(req, res) {
		res.render('docs');
	});

	/* Uncomment this section to use mongoDB */
	// // API call to mongoDB
	// app.get('<URI>', function(req, res) {
	// 	collection.find({}, {
	// 		'_id': 0,
	// 		'<insert column name>': 1
	// 	},
	// 	function(err, data) {
	// 		if (err)
	// 			res.send(err);
	// 		res.json(data);
	// 	});
	// });

	/* Experiment section */
	// GET experiment page
	app.get('/experiment', function(req, res) {
		res.render('experiment');
	});

	// Log all POST requests
	app.post('/log', function(req, res) {
		var file = 'experiments.txt';
		var line = req._startTime + ',' + JSON.stringify(req.body) + ';\r\n';
		fs.appendFile(file, line, function (err) {});
		res.end();
	});
}