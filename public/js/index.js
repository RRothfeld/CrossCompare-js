queue()
		.defer(d3.json, "/api/flights")
		.await(makeGraphs);

function makeGraphs(error, data) {

	var dataSet = data;
	var dateFormat = d3.time.format("%d/%m/%Y");
	dataSet.forEach(function(d) {
		d.Date = dateFormat.parse(d.Date);
				d.Date.setDate(1);
	});

	//Create a Crossfilter instance
	var ndx = crossfilter(data);

	//Define Dimensions
	var date = ndx.dimension(function(d) { return d.Date; });
	var carrier = ndx.dimension(function(d) { return d.UniqueCarrier; });

	//Calculate metrics
	var flightsByDate = date.group(); 
	var flightsByCarrier = carrier.group(); 

	var all = ndx.groupAll();

	//Calculate Groups
	var totalFlightsByDate = date.group().reduceCount(function(d) {
		return d.Date;
	});

	var totalFlightsByCarrier = carrier.group().reduceCount(function(d) {
		return d.UniqueCarrier;
	});

	var totalFlights = ndx.groupAll().reduceCount(function(d) {
		return d.Date;
	});

	//Define threshold values for data
	var minDate = date.bottom(1)[0].Date;
	var maxDate = date.top(1)[0].Date;

		//Charts
	var testchart1 = dc.lineChart("#testchart1");
	var testchart2 = dc.barChart("#testchart2");
	// var gradeLevelChart = dc.rowChart("#grade-chart");
	// var resourceTypeChart = dc.rowChart("#resource-chart");
	// var fundingStatusChart = dc.pieChart("#funding-chart");
	// var povertyLevelChart = dc.rowChart("#poverty-chart");
	// var totalProjects = dc.numberDisplay("#total-projects");
	// var netDonations = dc.numberDisplay("#net-donations");

	dc.dataCount("#row-selection")
		.dimension(ndx)
		.group(all);

	testchart1
		.height(220)
		.margins({top: 10, right: 10, bottom: 20, left: 25})
		.dimension(date)
		.group(totalFlightsByDate)
		.renderArea(true)
		.transitionDuration(500)
		.x(d3.time.scale().domain([minDate, maxDate]))
		.elasticY(true)
		.renderHorizontalGridLines(true)
		.renderVerticalGridLines(true)
		.yAxis().ticks(6);

	testchart2
		.height(220)
		.transitionDuration(1000)
		.dimension(carrier)
		.group(flightsByCarrier)
		.margins({top: 10, right: 10, bottom: 20, left: 35})
		.centerBar(false)
		.gap(5)
		.elasticY(true)
		.x(d3.scale.ordinal().domain(date))
		.xUnits(dc.units.ordinal)
		.renderHorizontalGridLines(true)
		.renderVerticalGridLines(true)
		.yAxis().ticks(6);

 //	selectField = dc.selectMenu('#menuselect')
 //				.dimension(state)
 //				.group(stateGroup); 

 //			 dc.dataCount("#row-selection")
 //				.dimension(ndx)
 //				.group(all);


	// totalProjects
	// 	.formatNumber(d3.format("d"))
	// 	.valueAccessor(function(d){return d; })
	// 	.group(all);

	// netDonations
	// 	.formatNumber(d3.format("d"))
	// 	.valueAccessor(function(d){return d; })
	// 	.group(netTotalDonations)
	// 	.formatNumber(d3.format(".3s"));



	// resourceTypeChart
 //				//.width(300)
 //				.height(220)
 //				.dimension(resourceType)
 //				.group(projectsByResourceType)
 //				.elasticX(true)
 //				.xAxis().ticks(5);

	// povertyLevelChart
	// 	//.width(300)
	// 	.height(220)
 //				.dimension(povertyLevel)
 //				.group(projectsByPovertyLevel)
 //				.xAxis().ticks(4);

	// gradeLevelChart
	// 	//.width(300)
	// 	.height(220)
 //				.dimension(gradeLevel)
 //				.group(projectsByGrade)
 //				.xAxis().ticks(4);

	
 //					fundingStatusChart
 //						.height(220)
 //						//.width(350)
 //						.radius(90)
 //						.innerRadius(40)
 //						.transitionDuration(1000)
 //						.dimension(fundingStatus)
 //						.group(projectsByFundingStatus);

	dc.renderAll();
};