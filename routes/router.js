// MongoDB collections
// var Flights = mongoConnection.model('', {}, 'flights');

module.exports = function(app) {
	// GET home page
	app.get('/', function(req, res) {
		res.render('index');
	});

	// GET example page
	app.get('/example', function(req, res) {
		res.render('example');
	});

	// GET documentation page
	app.get('/docs', function(req, res) {
		res.render('docs');
	});

	// API Flights (call to DB for data)
	// app.get('/api/flights', function(req, res) {
	// 	Flights.find({}, {
	// 		'_id': 0,
	// 		'Date': 1,
	// 		'UniqueCarrier': 1,
	// 		'ArrTime': 1,
	// 		'DepTime': 1
	// 	}, function(err, subjectDetails) {
	// 		if (err) res.send(err);
	// 		res.json(subjectDetails);
	// 	});
	// });
}