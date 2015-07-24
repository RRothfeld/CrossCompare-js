// INFO




// DC VERSION 2.1.0-dev
//--------------------------------General / DC---------------------------------------
// Define charts
var totalAverageDelay = dc.numberDisplay('#delay'),
		flightsTable = dc.dataTable('#flightsTable'),
		movementsChart = dc.lineChart('#movementsChart'),
		movementsTimeChart = dc.barChart('#movementsTimeChart'),
		weekdayChart = dc.rowChart('#weekdayChart'),
		todChart = dc.barChart('#todChart'),
		delayChart = dc.barChart('#delayChart'),
		distanceChart = dc.barChart('#distanceChart');
		// airlineDelayChart= dc.bubbleChart('#airlineDelayChart');

// http://colorbrewer2.org/
var colorRange = ['rgb(215,48,39)','rgb(252,141,89)','rgb(254,224,139)','rgb(217,239,139)','rgb(145,207,96)','rgb(26,152,80)'];

// Date and number formats
var dateInFormat = d3.time.format('%d-%m-%Y %H:%M'),
		dateOutFormat = d3.time.format('%d/%m/%Y %H:%M'),
		numberFormat = d3.format('0,000'),
		precisionFormat = d3.format('.2f');


//--------------------------------Crossfilter-----------------------------------------

// Load data from csv file
//d3.csv('/data/flightsDec08.csv', function(data) {
d3.csv('/data/MICRO.csv', function(data) {

	// Parse dates and times from .csv
	data.forEach(function (d) {
		d.DateTime = dateInFormat.parse(d.DateTime);
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
				return '' + adjustedNum + ' ' + d3.time.format('%A')(d.DateTime);
			}),
			hour = flights.dimension(function(d) { return d.DateTime.getHours(); }),
			delay = flights.dimension(function(d) { return Math.max(-60, Math.min(179, d.Delay)); }),
			distance = flights.dimension(function(d) { return Math.min(d.Distance, 2499); }),
			carrier = flights.dimension(function(d) { return d.Carrier; });

	// Define groups (reduce to counts)
	byDate = date.group(d3.time.day),
	byDateHour = date.group(d3.time.hour),
	// byDateInbound = date.group(d3.time.hour).reduce(
	// 	function(p, v) { if (v.Inbound == 1) p++;	return p; },
	// 	function(p, v) { if (v.Inbound == 1) p--; return p; },
	// 	function() { return 0; }
	// ),
	// byDateOutbound = date.group(d3.time.hour).reduce(
	// 	function(p, v) { if (v.Inbound != 1) p++; return p; },
	// 	function(p, v) { if (v.Inbound != 1) p--; return p; },
	// 	function() { return 0; }
	// ),
	byHour = hour.group(),
	byDelay = delay.group(function(d) { return Math.floor(d / 5) * 5; }),
	byDistance = distance.group(function(d) { return Math.floor(d / 100) * 100; }),
	byWeekday = weekday.group().reduce(
		function(p, v) { ++p.n; p.sumDelay += Number(v.Delay); return p; },
		function(p, v) { --p.n; p.sumDelay -= Number(v.Delay); return p; },
		function() { return { n: 0, sumDelay: 0 }; }
	),
	byCarrier = carrier.group(),
	delayByCarrier = carrier.group().reduce(
		function(p, v) {
			++p.n;
			p.sumDelay += Number(v.Delay);
			p.sumDistance += Number(v.Distance);
			return p;
		},
		function(p, v) {
			--p.n;
			p.sumDelay -= Number(v.Delay);
			p.sumDistance -= Number(v.Distance);
			return p;
		},
		function() { 
			return {
				n: 0,
				sumDelay: 0,
				sumDistance: 0
			};
		}
	),
	averageDelay = flights.groupAll().reduce(
		function(p, v) { ++p.n; p.sumDelay += Number(v.Delay); return p; },
		function(p, v) { --p.n; p.sumDelay -= Number(v.Delay); return p; },
		function() { return { n: 0, sumDelay: 0 }; }
	);

	//--------------------------------DC----------------------------------------------------

	// second row height
	var heightBottom = 100;

	// Date range
	var minDate = d3.time.day(date.bottom(1)[0].DateTime),
			lastDay = d3.time.day(date.top(1)[0].DateTime),
	 		maxDate = lastDay.setDate(lastDay.getDate() + 1);


	// Non-graph data representation
	dc.dataCount('#flights')
	.dimension(flights)
	.group(all)
	.html({ some:'%filter-count', all:'%total-count' });

	dc.dataCount('#resetAll')
	.dimension(flights)
	.group(all)
	.html({	some: '<a class=\'btn btn-box-tool btn-app\'><i class=\'fa fa-chain-broken\'></i>Clear all filters</a>',
		all:'<a class=\'btn btn-box-tool btn-app disabled\'><i class=\'fa fa-chain-broken\'></i>Clear all filters</a>' });

	totalAverageDelay
	.group(averageDelay)
	.formatNumber(precisionFormat)
	.valueAccessor(function(d) { return d.n ? d.sumDelay / d.n : 0; });

	// Define charts properties
	movementsChart
	.renderArea(true)
	.height(250)
	.margins({top: 5, right: 30, bottom: 20, left: 25})
	.dimension(date)
	// .group(byDateInbound, 'Inbound Flights')
	// .stack(byDateOutbound, 'Outbound Flights')
	.group(byDateHour)
	.elasticY(true)
	.x(d3.time.scale().domain([minDate, maxDate]))
	.renderHorizontalGridLines(true)
	.rangeChart(movementsTimeChart)
	.brushOn(false)
	.xAxis().ticks(4);
	movementsChart.yAxis().ticks(6);

	movementsTimeChart
	.height(36)
	.margins({top: 0, right: 30, bottom: 17, left: 25})
	.dimension(date)
	.group(byDate)
	.elasticY(true)
	.x(d3.time.scale().domain([minDate, maxDate]))
	.xUnits(d3.time.days)
	.round(d3.time.day.round)
	.xAxis().ticks(d3.time.days);

	weekdayChart
	.height(heightBottom)
	.margins({top: 0, right: 25, bottom: 17, left: 5})
	.dimension(weekday)
	.group(byWeekday)
	.valueAccessor(function(d) { return d.value.n ? d.value.sumDelay / d.value.n : 0; })
	.elasticX(true)
	.label(function (d) { return d.key.split(' ')[1]; })
	.xAxis().ticks(3);

	todChart
	.height(heightBottom)
	.margins({top: 0, right: 25, bottom: 17, left: 5})
	.dimension(hour)
	.group(byHour)
	.elasticY(true)
	.x(d3.scale.linear().domain([0, 24]))
	.round(dc.round.floor);

	delayChart
	.height(heightBottom)
	.margins({top: 0, right: 25, bottom: 17, left: 10})
	.dimension(delay)
	.group(byDelay)
	.elasticY(true)
	.x(d3.scale.linear().domain([-60, 180]))
	.xUnits(function(){ return 48; })  // ( 180 + 60 ) / 10
	.round(function(n) { return Math.round(n / 5) * 5; });
	
	distanceChart
	.height(heightBottom)
	.margins({top: 0, right: 30, bottom: 17, left: 5})
	.dimension(distance)
	.group(byDistance)
	.elasticY(true)
	.x(d3.scale.linear().domain([0, 2500]))
	.xUnits(function(){ return 25; }) // ( 2500 + 0 ) / 100
	.round(function(n) { return Math.round(n / 100) * 100; })
	.xAxis().ticks(6);

	//<------------------- SCATTER PLOT? x: time; y: delay; points 
	// airlineDelayChart
	// .height(300)
	// .margins({top: 0, right: 25, bottom: 30, left: 40})
	// .dimension(carrier) // top 10 ?
	// .group(delayByCarrier)
	// .maxBubbleRelativeSize(0.1)
	// .x(d3.scale.linear().domain([0, 1])) // overwritten by elastic
	// .y(d3.scale.linear().domain([0, 1])) // overwritten by elastic
	// .yAxisPadding(100)
	// .xAxisPadding(10)
	// .elasticY(true)
	// .elasticX(true)
	// .colors(colorRange)
	// .colorDomain([60, 0]) // switched
	// .colorAccessor(function (d) { return d.value.sumDelay / d.value.n; })
	// .keyAccessor(function (p) { return p.value.sumDelay / p.value.n; })
	// .valueAccessor(function (p) { return p.value.sumDistance / p.value.n; })
	// .radiusValueAccessor(function (p) { return p.value.n; })
	// .renderHorizontalGridLines(true)
	// .renderVerticalGridLines(true)
	// .xAxisLabel('Mean Delay (min)')
	// .yAxisLabel('Mean Flight Distance (miles)');

	// Format info labels
	movementsChart.title(function(p) {
		return 'Date: ' + dateOutFormat(p.key) + '\n'
		+ 'Number of Flights: ' + numberFormat(p.value);
	});

	weekdayChart.title(function(p) {
		return p.key.split(' ')[1] + '\n'
		+ 'Mean Delay: ' + precisionFormat(p.value.sumDelay / p.value.n) + ' minutes\n'
		+ 'Number of Flights: ' + numberFormat(p.value.n);
	});

	// airlineDelayChart.title(function(p) {
	// 	return 'Airline: ' + p.key + '\n'
	// 	+ 'Mean Delay: ' + precisionFormat(p.value.sumDelay / p.value.n) + ' minutes\n'
	// 	+ 'Mean Distance: ' + numberFormat(precisionFormat(p.value.sumDistance / p.value.n)) + ' miles\n'
	// 	+ 'Number of Flights: ' + numberFormat(p.value.n);
	// });

	resetableCharts = [
		movementsTimeChart,
		weekdayChart,
		todChart,
		delayChart,
		distanceChart,
		// airlineDelayChart
	];

	// Add reset button handling
	resetableCharts.forEach(function(chart) {
		chart.on('filtered', function(chart, filter) { checkReset(chart); });

		$('#reset' + chart.anchorName()).click(function() {
			chart.filterAll();
			dc.redrawAll();
		});
	});

	function checkReset(chart) {
		setTimeout(function() {
			var chartName = chart.anchorName();

			if ($('#' + chartName).find('.reset').css('display') != 'none')
				$('#reset' + chartName).removeClass('disabled');
			else
				$('#reset' + chartName).addClass('disabled');

		}, 50);// need timeout otherwise check is performed, before reset is inserted
	};

	flightsTable
	.size(15)
	.dimension(carrier)
	.group(function (d) { return d3.time.format('%d %B %Y')(d.DateTime) })
	.columns([
		{
			label: 'Time',
			format: function (d) { return d3.time.format('%H:%M')(d.DateTime) }
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
			format: function (d) { return d3.format('0,000')(d.Distance) + ' miles'; }
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
	.on('postRender', function(chart) { // Correct group ordering of table
		var table =  $('#' + chart.anchorName());
		var tbodies = table.children('tbody');
		table.append(tbodies.get().reverse());
	})
	.on('postRedraw', function(chart) { // Correct group ordering of table
		var table =  $('#' + chart.anchorName());
		var tbodies = table.children('tbody');
		table.append(tbodies.get().reverse());
	});


	// Update charts' widths
	function renderCharts() {
		// Retrieve available space for charts via DOM
		var half = $('#width-half').width(),
				quarter = $('#width-quarter').width();
		
		// Set chart widths
		movementsChart.width(half)
		//.legend(dc.legend().x(large - 135).y(0).itemHeight(10).gap(10));
		movementsTimeChart.width(half);
		weekdayChart.width(quarter);
		delayChart.width(half);
		todChart.width(quarter);
		distanceChart.width(quarter);
		// airlineDelayChart.width(full);

		// Update all charts
		dc.renderAll();

		// Hide loading icons
		$('.loading').hide();
	}

	// Render charts upon page load
	renderCharts();


	// jQuery Events
	// Reset button
	$('#resetAll').on('click', function() {
		dc.filterAll();

		$('#airportSelect').val('ALL');
		airport.filterAll();

		dc.redrawAll();
	});

	// Render charts upon page resize
	$(window).resize(function() {
		// Filters are not re-sizable ...
		renderCharts(); // Re-render charts
	});

	// Airport selection menu
	$('#airportSelect').on('change', function() {
		if (this.value == 'ALL') airport.filterAll();
		else airport.filter(this.value);

		dc.redrawAll();
	});

//-------------------------------CC-----------------------------------------------

	// Example handling for showing/hiding CrossCompare
	$('.openCross').on('click', function() {
		$('.box.box-danger').removeClass('hidden');
	});

	$('#resetCrossCompare').on('click', function() {
		$('.box.box-danger').addClass('hidden');
	});


	// CrossCompare specific logic
	crosscompare
	.setHeight(300)
	.add('#crossMovementsChart', movementsChart, 'line')
	.add('#crossWeekdayChart', weekdayChart, 'bar')
	.add('#crossTodChart', todChart, 'bar')
	.add('#crossDelayChart', delayChart, 'bar')
	.add('#crossDistanceChart', distanceChart, 'bar');
	//.add('#crossAirlineDelayChart', airlineDelayChart, 'scatter');

	$('#resetCrossCompare').on('click', function() {
		crosscompare.reset();
	});

});

//-------------------------------Overlay-----------------------------------------------
var infoOptions = {
	type: 'tooltip',
	vertical: 'top',
	horizontal: 'left',
	offsetleft: 75,
	transition: '0.3s all 0.1s',
	closeelement: '.info_close'
};

$('#infoMovementsChart').popup(infoOptions, { tooltipanchor: $('.infoMovementsChart_open') });
$('#infoWeekdayChart').popup(infoOptions, {  tooltipanchor: $('.infoWeekdayChart_open') });
$('#infoTodChart').popup(infoOptions, { tooltipanchor: $('.infoMovementsChart_open') });
$('#infoDelayChart').popup(infoOptions, { tooltipanchor: $('.infoMovementsChart_open') });
$('#infoDistanceChart').popup(infoOptions, { horizontal: 'left', tooltipanchor: $('.infoMovementsChart_open') });
// $('#infoAirlineDelayChart').popup(infoOptions, { horizontal: 'left', tooltipanchor: $('.infoMovementsChart_open') });
$('#infoFlightsTable').popup(infoOptions, { horizontal: 'left', tooltipanchor: $('.infoMovementsChart_open') });