// Define charts
var movementsChart = dc.lineChart('#movements-chart'),
		movementsTimeChart = dc.barChart('#movements-time-chart'),
		destinationChart = dc.rowChart('#destinations-chart'),
		delayChart = dc.barChart('#delay-length-chart');

// Load data from csv file
//d3.csv("/data/flightsDec08.csv", function(data) {
d3.csv("/data/MINI.csv", function(data) {

	// Parse dates and times from .csv
	var dateFormat = d3.time.format('%d-%m-%Y'),
			timeFormat = d3.time.format('%H:%M');
	data.forEach(function (d) {
			d.DDMMYYYY = dateFormat.parse(d.DDMMYYYY);
			d.ArrTimeRounded = timeFormat.parse(d.ArrTimeRounded);
			d.DepTimeRounded = timeFormat.parse(d.DepTimeRounded);
	});

	// Set up crossfilter
	var flights = crossfilter(data),
			all = flights.groupAll();

	// Define dimensions
	var date = flights.dimension(function(d) { return d.DDMMYYYY; }),
			dest = flights.dimension(function(d) { return d.Dest; }),
			delay = flights.dimension(function(d) { return d.ArrDelay; }),
			carrier = flights.dimension(function(d) { return d.Carrier; }),
			arrtime = flights.dimension(function(d) { return d.ArrTimeRounded; }),
			deptime = flights.dimension(function(d) { return d.DepTimeRounded; });

	// Define groups (reduce to counts)
	var byDate = date.group(),
			byDest = dest.group(),
			byDelay = delay.group(),
			byArrTime = arrtime.group(),
			byDepTime = deptime.group();

	// Date range
	var minDate = date.bottom(1)[0].DDMMYYYY,
			maxDate = date.top(1)[0].DDMMYYYY;

	// Delay range
	var minDelay = -40,
			maxDelay = 90;

	dc.dataCount('.dc-data-count')
		.dimension(flights)
		.group(all)
		.html({
			some:'<strong>%filter-count</strong> selected out of <strong>%total-count</strong> records' +
				' | <a href=\'javascript:dc.filterAll(); dc.renderAll();\'\'>Reset All</a>',
			all:'All records selected. Please click on the graph to apply filters.'
		});

	renderCharts = function () {
		// Retrieve available space for charts
		var movementsChartWidth = $('#movements-chart-width').width(),
				destinationChartWidth = $('#destinations-chart-width').width(),
				delayChartWidth = $('#delay-length-chart-width').width();

		// Define charts properties
		movementsChart
		.renderArea(true)
		.width(movementsChartWidth)
		.height(300)
		.margins({top: 10, right: 50, bottom: 30, left: 50})
		.dimension(date)
		.group(byDate)
		.elasticY(true)
		.x(d3.time.scale().domain([minDate, maxDate]))
		.renderHorizontalGridLines(true)
		.xUnits(d3.time.days)
		.mouseZoomable(true)
		.yAxis().ticks(7);

		movementsTimeChart
		.width(movementsChartWidth)
		.height(40)
		.margins({top: 0, right: 50, bottom: 20, left: 50})
		.dimension(date)
		.group(byDate)
		.centerBar(true)
		.x(d3.time.scale().domain([minDate, maxDate]))
		.xUnits(d3.time.days)
		.gap(1)
		.yAxis().ticks(0);

		destinationChart
		.width(destinationChartWidth)
		.height(300)
		.margins({top: 20, left: 10, right: 25, bottom: 20})
		.dimension(dest)
		.group(byDest)
		.gap(1)
		.elasticX(true)
		.data(function (group) { return group.top(10); })
		.xAxis().ticks(7);

		delayChart
		.width(delayChartWidth)
		.height(250)
		.margins({top: 10, right: 50, bottom: 30, left: 50})
		.dimension(delay)
		.group(byDelay)
		.gap(1)
		.elasticY(true)
		.x(d3.scale.linear().domain([minDelay, maxDelay]))
		.renderHorizontalGridLines(true)
		.mouseZoomable(false)
		.yAxis().ticks(7);

		// Render all charts
		dc.renderAll();
	};

	// Render charts upon page load
	renderCharts();

	// Render charts upon page resize
	$(window).resize(function() {
		dc.filterAll(); // Reset filters as filters are not re-sizable
		renderCharts();
	});
});

