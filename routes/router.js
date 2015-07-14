// MongoDB collections
// var Flights = mongoConnection.model('', {}, 'flightsExtract');

module.exports = function(app) {
	// GET Home page
	app.get('/', function(req, res) {
		res.render('index');
	});

	// Get Airport Dashboard Example
	app.get('/airport', function(req, res) {
		res.render('airport');
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