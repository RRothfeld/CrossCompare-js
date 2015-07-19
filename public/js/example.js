// Define charts
var totalAverageDelay = dc.numberDisplay('#delay'),
		movementsChart = dc.lineChart('#movements-chart'),
		movementsTimeChart = dc.barChart('#movements-time-chart'),
		weekdayChart = dc.rowChart('#weekday-chart'),
		todChart = dc.barChart('#tod-chart'),
		delayChart = dc.barChart('#delay-length-chart'),
		distanceChart = dc.barChart('#distance-chart'),
		airlineDelayChart= dc.bubbleChart('#airline-delay-chart');
		flightsTable = dc.dataTable('#flights-table');

// Make groups available
var	byDate,
		byHour,
		byDelay,
		byDistance,
		byWeekday,
		byCarrier,
		delayByCarrier,
		averageDelay;

// http://colorbrewer2.org/
var colorRange = ['rgb(215,48,39)','rgb(244,109,67)','rgb(253,174,97)','rgb(254,224,139)','rgb(255,255,191)','rgb(217,239,139)','rgb(166,217,106)','rgb(102,189,99)','rgb(26,152,80)'];

// Load data from csv file
//d3.csv("/data/flightsDec08.csv", function(data) {
d3.csv("/data/MINI.csv", function(data) {

	// Record time of calculations
	var now = new Date();

	// Parse dates and times from .csv
	data.forEach(function (d) {
		d.DateTime = d3.time.format('%d-%m-%Y %H:%M').parse(d.DateTime);
	});

	// Set up crossfilter
	var flights = crossfilter(data),
			all = flights.groupAll();

	// Define dimensions
	var airport = flights.dimension(function(d) { return d.Airport; }),
			date = flights.dimension(function(d) { return d.DateTime; }),
			weekday = flights.dimension(function(d) {
				// Make sunday last (let week begin with Monday)
				var adjustedNum = (d.DateTime.getDay() == 0) ? 7 : d.DateTime.getDay() ;
				return '' + adjustedNum + ' ' + d3.time.format("%A")(d.DateTime);
			}),
			hour = flights.dimension(function(d) { return d.DateTime.getHours(); }),
			delay = flights.dimension(function(d) { return Math.max(-60, Math.min(179, d.Delay)); }),
			distance = flights.dimension(function(d) { return Math.min(d.Distance, 2499); }),
			carrier = flights.dimension(function(d) { return d.Carrier; });

	// Define groups (reduce to counts)
	byDate = date.group(d3.time.day),
	byHour = hour.group(),
	byDelay = delay.group(function(d) { return Math.floor(d / 10) * 10; }),
	byDistance = distance.group(function(d) { return Math.floor(d / 100) * 100; }),
	byWeekday = weekday.group(),
	byCarrier = carrier.group(),
	delayByCarrier = carrier.group().reduce(
		function(p, v) {
			++p.totalFlights;
			p.sumDelay += Number(v.Delay);
			p.avgDelay = p.sumDelay / p.totalFlights;
			p.sumDistance += Number(v.Distance);
			p.avgDistance = p.sumDistance / p.totalFlights;
			return p;
		},
		function(p, v) {
			--p.totalFlights;
			p.sumDelay -= Number(v.Delay);
			p.avgDelay = p.sumDelay / p.totalFlights;
			p.sumDistance -= Number(v.Distance);
			p.avgDistance = p.sumDistance / p.totalFlights;
			return p;
		},
		function() { 
			return {
				totalFlights: 0,
				sumDelay: 0,
				avgDelay: 0,
				sumDistance: 0,
				avgDistance: 0
			};
		}
	),
	averageDelay = flights.groupAll().reduce(
		function(p, v) {
			++p.totalFlights;
			p.sumDelay += Number(v.Delay);
			return p;
		},
		function(p, v) {
			--p.totalFlights;
			p.sumDelay -= Number(v.Delay);
			return p;
		},
		function() {
			return {
				totalFlights: 0,
				sumDelay: 0
			};
		}
	);

	// Date range (January = 0, February = 1, ...)
	console.log();

	var minDate = new Date(2008, 10, 31),
			maxDate = new Date(2008, 11, 31);

	// Non-graph data representation
	dc.dataCount('#flights')
	.dimension(flights)
	.group(all)
	.html({ some:'%filter-count', all:'%total-count' });

	totalAverageDelay
	.group(averageDelay)
	.valueAccessor(function(d) { return d.totalFlights ? d.sumDelay / d.totalFlights : 0; });

	// Define charts properties
	movementsChart
	.renderArea(true)
	.height(310)
	.margins({top: 5, right: 40, bottom: 30, left: 40})
	.dimension(date)
	.group(byDate, 'Inbound Flights')
	.stack(byDate, 'Outbound Flights')
	.elasticY(true)
	.x(d3.time.scale().domain([minDate, maxDate]))
	.renderHorizontalGridLines(true)
	.rangeChart(movementsTimeChart)
	.mouseZoomable(false)
	.brushOn(false)
	.xUnits(d3.time.days);

	movementsTimeChart
	.height(40)
	.margins({top: 0, right: 40, bottom: 17, left: 40})
	.dimension(date)
	.group(byDate)
	.elasticY(true)
	.x(d3.time.scale().domain([minDate, maxDate]))
	.xUnits(d3.time.days)
	.yAxis().ticks(0);

	weekdayChart
	.height(144)
	.margins({top: 0, right: 25, bottom: 17, left: 5})
	.dimension(weekday)
	.group(byWeekday)
	.elasticX(true)
	.label(function (d) { return d.key.split(' ')[1]; })
	.xAxis().ticks(3);

	todChart
	.height(150)
	.margins({top: 0, right: 25, bottom: 20, left: 5})
	.dimension(hour)
	.group(byHour)
	.elasticY(true)
	.x(d3.scale.linear().domain([0, 24]));

	// Make into percentiles
	delayChart
	.height(150)
	.margins({top: 0, right: 25, bottom: 20, left: 10})
	.dimension(delay)
	.group(byDelay)
	.elasticY(true)
	.x(d3.scale.linear().domain([-60, 180]))
	.xUnits(function(){ return 24; }); // ( 180 + 60 ) / 10

	distanceChart
	.height(150)
	.margins({top: 0, right: 30, bottom: 20, left: 5})
	.dimension(distance)
	.group(byDistance)
	.elasticY(true)
	.x(d3.scale.linear().domain([0, 2500]))
	.xUnits(function(){ return 25; }) // ( 2500 + 0 ) / 100
	.xAxis().ticks(6);

	airlineDelayChart
	.height(300)
	.margins({top: 5, right: 40, bottom: 30, left: 40})
	.dimension(carrier) // top 10 ?
	.group(delayByCarrier)
	.maxBubbleRelativeSize(0.1)
	.x(d3.scale.linear().domain([0, 1])) // overwritten by elastic
	.y(d3.scale.linear().domain([0, 1])) // overwritten by elastic
	.r(d3.scale.linear().domain([0, byCarrier.top(1)[0].value])) // repeat!!!!!
	.yAxisPadding(100)
	.xAxisPadding(10)
	.elasticY(true)
	.elasticX(true)
	.colors(colorRange)
	.colorDomain([60, 0]) // switched
	.colorAccessor(function (d) { return d.value.avgDelay; })
	.keyAccessor(function (p) { return p.value.avgDelay; })
	.valueAccessor(function (p) { return p.value.avgDistance; })
	.radiusValueAccessor(function (p) { return p.value.totalFlights; });

	// Correct group ordering of table
	function reorderTable() {
		var table =  $('#flights-table');
		var tbodies = table.children('tbody');
		table.append(tbodies.get().reverse());
	}

	flightsTable
	.size(15)
	.dimension(carrier)
	.group(function (d) { return d3.time.format("%d %B %Y")(d.DateTime) })
	.columns([
		{
			label: 'Time',
			format: function (d) { return d3.time.format("%H:%M")(d.DateTime) }
		},
		{
			label: 'Delay',
			format: function (d) {
				if (d.Delay > 0) return '<span style=\'color:' + colorRange[0] + ';\'>+' + d.Delay + ' min</span>';
				else return '<span style=\'color:' + colorRange[colorRange.length - 1] + ';\'>' + d.Delay + ' min</span>';
			}
		},
		{
			label: 'Origin',
			format: function (d) {
				if (d.Inbound == 1) return d.Airport2;
				else return d.Airport;
			}
		},
		{
			label: 'Destination',
			format: function (d) {
				if (d.Inbound != 1) return d.Airport2;
				else return d.Airport;
			}
		},
		{
			label: 'Airline',
			format: function (d) { return d.Carrier; }
		},
		{
			label: 'Distance',
			format: function (d) { return d3.format("0,000")(d.Distance) + ' miles'; }
		},
		{
			label: 'Type',
			format: function (d) { 
				if (d.Inbound == 1) return 'Arrival';
				else return 'Departure';
			}
		},
	])
	.sortBy(function(d) { return -d.DateTime; }) // minus as newest is top
	.on("postRedraw", function(chart) { reorderTable(); });



	// Update charts' widths
	function renderCharts() {
		// Retrieve available space for charts via DOM
		var full = $('#12-width').width(),
				large = $('#8-12-12-width').width(),
				medium = $('#4-12-12-width').width(),
				small = $('#4-6-12-width').width(),
				tiny = $('#4-4-12-width').width();
		
		// Set chart widths
		movementsChart.width(large).legend(dc.legend().x(large - 135).y(0).itemHeight(10).gap(10));
		movementsTimeChart.width(large);
		weekdayChart.width(medium);
		todChart.width(tiny);
		delayChart.width(tiny);
		distanceChart.width(tiny);
		airlineDelayChart.width(full);

		// Update all charts
		dc.renderAll();

		// Correct group ordering of table
		reorderTable();

		// Hide loading icons
		$('.loading').hide();
	}

	// Render charts upon page load
	renderCharts();


	// JQUERY
	// Render charts upon page resize
	$(window).resize(function() {
		// Filters are not re-sizable ...
		renderCharts(); // Re-render charts
	});

	// Airport selection menu
	$('#airport-select').on('change', function() {
		if (this.value == 'ALL') airport.filterAll();
		else airport.filter(this.value);
		
		// Update max radius
		airlineDelayChart.r(d3.scale.linear().domain([0, byCarrier.top(1)[0].value]))

		dc.redrawAll();
	});
});