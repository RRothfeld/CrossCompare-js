/* Uncomment this section to use mongoDB */
// // MongoDB collections
// var collection = mongoConnection.model('', {}, '<insert collection name>');

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
}