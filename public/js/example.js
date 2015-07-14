queue()
	// API call for current data (for deployment)
	.defer(d3.json, "/data/flightsDec08.json").await(drawGraphs);

function drawGraphs(error, data) {
		// Parse the date
		var dataSet = data;
		// var dateFormat = d3.time.format("%d-%m-%Y");
		// dataSet.forEach(function(d) {
		// 	d.DDMMYYYY = dateFormat.parse(d.DDMMYYYY);
		// 	d.DDMMYYYY.setDate(1);
		// });

		//Create a Crossfilter instance
		var flights = crossfilter(dataSet);

		//Define Dimensions
		var date = flights.dimension(function(d) { return d.DDMMYYYY; }),
				carrier = flights.dimension(function(d) { return d.Carrier; });

		//Calculate metrics
		var flightsByDate = date.group(),
				flightsByCarrier = carrier.group(); 

		var all = flights.groupAll();

		var stateDonations = dc.barChart("#movements-chart");

		dc.dataCount("#total-filter")
			.dimension(flights)
			.group(all);

		stateDonations
			.height(220)
			.transitionDuration(1000)
			.dimension(date)
			.group(flightsByDate)
			.margins({top: 10, right: 50, bottom: 30, left: 50})
			.centerBar(false)
			.gap(5)
			.elasticY(true)
			.x(d3.scale.ordinal().domain(date))
			.xUnits(dc.units.ordinal)
			.renderHorizontalGridLines(true)
			.renderVerticalGridLines(true)
			.yAxis().tickFormat(d3.format("s"));

		dc.renderAll();
};