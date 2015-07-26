// INFO




// DC VERSION 2.1.0-dev
//--------------------------------General / DC---------------------------------------
// Define charts
var totalAverageDelay = dc.numberDisplay('#delay'),
		flightsTable = dc.dataTable('#flightsTable'),
		flightDelay = dc.scatterPlot('#flightDelay'),
		movementsChart = dc.lineChart('#movementsChart'),
		movementsTimeChart = dc.barChart('#movementsTimeChart'),
		airportsChart = dc.rowChart('#airportsChart'),
		weekdayChart = dc.rowChart('#weekdayChart'),
		todChart = dc.barChart('#todChart'),
		delayChart = dc.barChart('#delayChart'),
		distanceChart = dc.barChart('#distanceChart');

// http://colorbrewer2.org/
var colorRange = ['rgb(165,0,38)','rgb(215,48,39)','rgb(244,109,67)','rgb(253,174,97)','rgb(254,224,139)','rgb(217,239,139)','rgb(166,217,106)','rgb(102,189,99)','rgb(26,152,80)','rgb(0,104,55)'];

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
			scndAirport = flights.dimension(function(d) { return d.Airport2; }),
			scatter = flights.dimension(function(d) { return [d.DateTime.getHours() + Math.floor(d.DateTime.getMinutes()/5)*5/60, (Math.max(-60, Math.min(179, d.Delay)))]; }),
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
	byHour = hour.group(),
	byScndAirport = scndAirport.group(),
	byScatter = scatter.group(),
	byDelay = delay.group(function(d) { return Math.floor(d / 5) * 5; }),
	byDistance = distance.group(function(d) { return Math.floor(d / 100) * 100; }),
	byWeekday = weekday.group().reduce(
		function(p, v) { ++p.n; p.sumDelay += Number(v.Delay);
			p.avgDelay = p.n ? p.sumDelay / p.n : 0; return p; },
		function(p, v) { --p.n; p.sumDelay -= Number(v.Delay);
			p.avgDelay = p.n ? p.sumDelay / p.n : 0; return p; },
		function() { return { n: 0, sumDelay: 0, avgDelay: 0 }; }
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
	var heightTall = 300,
			heightShort = 107;

	// Date range
	var minDate = d3.time.day(date.bottom(1)[0].DateTime),
			lastDay = d3.time.day(date.top(1)[0].DateTime),
	 		maxDate = lastDay.setDate(lastDay.getDate() + 1);

	// Non-graph data representation
	dc.dataCount('#flights')
	.dimension(flights)
	.group(all)
	.html({ some:'Total Flights: <strong>%filter-count</strong><small>/%total-count</small>',
		all:'Total Flights: <strong>%filter-count</strong><small> (all)</small>' });

	dc.dataCount('#resetAll')
	.dimension(flights)
	.group(all)
	.html({	some: '<a class=\'btn btn-default btn-block\'><i class=\'fa fa-chain-broken\'></i> Reset All</a>',
		all:'<a class=\'btn btn-block btn-default disabled\'><i class=\'fa fa-chain-broken\'></i> Reset All</a>' });

	totalAverageDelay
	.group(averageDelay)
	.formatNumber(precisionFormat)
	.valueAccessor(function(d) { return d.n ? d.sumDelay / d.n : 0; });

	// Define charts properties
	movementsChart
	.clipPadding(10)
	.renderArea(true)
	.height(250)
	.margins({top: 5, right: 30, bottom: 20, left: 25})
	.dimension(date)
	.group(byDateHour)
	.mouseZoomable(true)
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

	flightDelay
	.height(291)
	.margins({top: 5, right: 30, bottom: 20, left: 25})
	.clipPadding(10)
	.dimension(scatter)
	.group(byScatter)
	.symbolSize(6)
	.y(d3.scale.linear().domain([-60, 185]))
	.x(d3.scale.linear().domain([0, 24]))
	.renderHorizontalGridLines(true);
	flightDelay.yAxis().ticks(6);

	airportsChart
	.height(heightTall)
	.margins({top: 0, right: 25, bottom: 17, left: 5})
	.dimension(scndAirport)
	.group(byScndAirport)
	.rowsCap(10)
	.elasticX(true)
	.ordering(function(d) { return -d.value; })
	.xAxis().ticks(3);

	weekdayChart
	.height(heightTall)
	.margins({top: 0, right: 25, bottom: 17, left: 5})
	.dimension(weekday)
	.group(byWeekday)
	.valueAccessor(function(d) { return d.value.avgDelay; })
	.elasticX(true)
	.label(function (d) { return d.key.split(' ')[1]; })
	.xAxis().ticks(3);

	todChart
	.height(heightShort)
	.margins({top: 0, right: 25, bottom: 17, left: 5})
	.dimension(hour)
	.group(byHour)
	.elasticY(true)
	.x(d3.scale.linear().domain([0, 24]))
	.round(dc.round.floor);

	delayChart
	.height(heightShort)
	.margins({top: 0, right: 25, bottom: 17, left: 10})
	.dimension(delay)
	.group(byDelay)
	.elasticY(true)
	.x(d3.scale.linear().domain([-60, 180]))
	.xUnits(function(){ return 48; })	// ( 180 + 60 ) / 10
	.round(function(n) { return Math.round(n / 5) * 5; });
	
	distanceChart
	.height(heightShort)
	.margins({top: 0, right: 30, bottom: 17, left: 5})
	.dimension(distance)
	.group(byDistance)
	.elasticY(true)
	.x(d3.scale.linear().domain([0, 2500]))
	.xUnits(function(){ return 25; }) // ( 2500 + 0 ) / 100
	.round(function(n) { return Math.round(n / 100) * 100; })
	.xAxis().ticks(6);

	// Format info labels
	movementsChart.title(function(p) {
		return 'Date: ' + dateOutFormat(p.key) + '\n'
		+ 'Number of Flights: ' + numberFormat(p.value);
	});

	airportsChart.title(function(p) {
		return p.key + '\n'
		+ 'Number of Flights: ' + numberFormat(p.value);
	});

	weekdayChart.title(function(p) {
		return p.key.split(' ')[1] + '\n'
		+ 'Mean Delay: ' + precisionFormat(p.value.avgDelay) + ' minutes\n'
		+ 'Number of Flights: ' + numberFormat(p.value.n);
	});

	resetableCharts = [
		movementsTimeChart,
		flightDelay,
		airportsChart,
		weekdayChart,
		todChart,
		delayChart,
		distanceChart
	];

	// Add reset button handling
	resetableCharts.forEach(function(chart) {
		chart.on('preRedraw', function(chart, filter) { checkReset(chart); });

		$('#reset' + chart.anchorName()).click(function() {
			chart.filterAll();
			dc.redrawAll();
		});
	});

	function checkReset(chart) {
			var name = chart.anchorName();

			if ($('#' + name + ' > .reset').css('display') != 'none') {
				$('#reset' + name).removeClass('disabled');
			} else {
				$('#reset' + name).addClass('disabled'); }
	};

	flightsTable
	.size(20)
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
		var table =	$('#' + chart.anchorName());
		var tbodies = table.children('tbody');
		table.append(tbodies.get().reverse());
	})
	.on('postRedraw', function(chart) { // Correct group ordering of table
		var table =	$('#' + chart.anchorName());
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
		movementsTimeChart.width(half);
		flightDelay.width(half);
		airportsChart.width(quarter);
		weekdayChart.width(quarter);
		delayChart.width(half);
		todChart.width(quarter);
		distanceChart.width(quarter);

		// Update all charts
		dc.renderAll();

		// Hide loading icons
		$('.loading').hide();
	}

	// Render charts upon page load
	renderCharts();

	// reset all when page is loaded
	dc.filterAll();

	// jQuery Events
	// Reset button
	$('#resetAll').on('click', function() {
		dc.filterAll();

		$('#airportSelect').val('ALL');
		airport.filterAll();

		$('#airlineSelect').val('ALL');
		carrier.filterAll();

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

	// Airline selection menu
	$('#airlineSelect').on('change', function() {
		if (this.value == 'ALL') carrier.filterAll();
		else carrier.filter(this.value);

		dc.redrawAll();
	});

	// Colour chooser
	var colours = false;
	$('#colourflightDelay').on('click', function() {
		$(this).find('i').toggle();

		if (!colours) {
			flightDelay.colors(colorRange)
			flightDelay.colorDomain([90, 0]) // switched
			flightDelay.colorAccessor(function (d) { return d.key[1]; })
			colours = true;
		} else {
			flightDelay.colors(d3.scale.category10().range()[0]); // standard blue
			colours = false;
		}

		flightDelay.redraw();
	}); // toggle icons

//-------------------------------CC-----------------------------------------------

	// Example handling for showing/hiding CrossCompare
	$('.openCross').on('click', function() {
		$('#crosscompareInfo').slideDown('fast');
	});

	$('.closeCross').on('click', function() {
		$('#crosscompareInfo').slideUp('fast');
	});

	// CrossCompare specific logic
	crosscompare
	.setHeight(500)
	.setWidth(900)
	.addLegend('#airportSelect')
	.addLegend('#airlineSelect')
	.addLegend(movementsTimeChart)
	.add(movementsChart, 'line')
	.add(airportsChart, 'bar')
	.add(weekdayChart, 'bar', 'avgDelay')
	.add(todChart, 'bar')
	.add(delayChart, 'bar')
	.add(distanceChart, 'bar');

	$('.maxCrossCompare_open').on('click', function() { crosscompare.render(); });

	$('#maxCrossCompare').popup({ transition: '0.2s all 0.1s' });

	$('.resetCrossCompare').on('click', function() { crosscompare.reset(); });

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
$('#infoflightDelay').popup(infoOptions, {	tooltipanchor: $('.infoflightDelay_open') });
$('#infoairportsChart').popup(infoOptions, {	tooltipanchor: $('.infoairportsChart_open') });
$('#infoWeekdayChart').popup(infoOptions, {	tooltipanchor: $('.infoWeekdayChart_open') });
$('#infoTodChart').popup(infoOptions, { tooltipanchor: $('.infoMovementsChart_open') });
$('#infoDelayChart').popup(infoOptions, { tooltipanchor: $('.infoMovementsChart_open') });
$('#infoDistanceChart').popup(infoOptions, { tooltipanchor: $('.infoMovementsChart_open') });