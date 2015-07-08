// MongoDB collections
var Flights = mongoConnection.model('', {}, 'flightsExtract');

module.exports = function(app) {
	// API Flights
	app.get('/api/flights', function(req, res) {
		Flights.find({}, {
			'_id': 0,
			'Date': 1,
			'UniqueCarrier': 1,
			'ArrTime': 1,
			'DepTime': 1
		}, function(err, subjectDetails) {
			if (err) res.send(err);
			res.json(subjectDetails);
		});
	});

	// Answer all non-API calls with index page
	app.get('/', function(req, res) {
		res.render('index');
	});

	// Redirect unknown requests to index
	app.get('*', function(req, res) {
		res.redirect('/');
	});
}