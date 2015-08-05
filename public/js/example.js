/**
 * CrossCompare.js Example - Air Traffic Delay Dashboard
 * 
 * Github - https://github.com/RRothfeld/CrossCompare-js
 * MIT License - https://github.com/RRothfeld/CrossCompare-js/blob/master/LICENSE
 *
 * @author RRothfeld
 */


/* Part 0 - Global settings and variables */

// Define DC.js charts
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

// Define color range (red to blue) - via http://colorbrewer2.org/
var colorRange = ['rgb(165,0,38)','rgb(215,48,39)','rgb(244,109,67)',
	'rgb(253,174,97)','rgb(254,224,139)','rgb(217,239,139)','rgb(166,217,106)',
	'rgb(102,189,99)','rgb(26,152,80)','rgb(0,104,55)'];

// Define date and number formats
var dateInFormat = d3.time.format('%d-%m-%Y %H:%M'),
		dateOutFormat = d3.time.format('%d/%m/%Y %H:%M'),
		numberFormat = d3.format('0,000'), // Insert thousands separator
		precisionFormat = d3.format('.2f'); // Limit to two decimal places

// Define constants
var DELAY_MIN = -60, // Minimum delay to be illustrated
		DELAY_MAX = 179, // Maximum delay to be illustrated
		DISTANCE_MAX = 2499, // Maximum delay to be illustrated
		CHART_L = 300, // Height of a large chart
		CHART_S = 107; // Height of a small chart


/* Part 1 - Crossfilter */

// Load static data from csv file (alternatively, an API, defined in router.js,
// call for mongoDB could be made here)
d3.csv('data/example.csv', function(data) {

	// Parse dates and times from csv-file to JavaScript dates
	data.forEach(function (d) {
		d.DateTime = dateInFormat.parse(d.DateTime);
	});

	// Set up crossfilter
	var flights = crossfilter(data),
			all = flights.groupAll();

	/**
	 * Limits a number to be within a certain range.
	 * @param  {number} number The number to be fitted into the range.
	 * @param  {number} min    The minimum value allowed.
	 * @param  {number} max    The maximum value allowed.
	 * @return {number}        The number fitted into the range.
	 */
	function limit(number, min, max) {
		return Math.max(min, Math.min(max, number));
	};

	/**
	 * Cluster numbers to defined groups (e.g. minutes into 5-minute-clusters).
	 * @param  {number} number The number to be assigned to a group.
	 * @param  {number} group  The value by which to group.
	 * @return {number}        The grouped value.
	 */
	function cluster(number, group) {
		return Math.floor(number / group) * group;
	};

	// Define crossfilter dimensions
	var airport = flights.dimension(function(d) { return d.Airport; }),
			scndAirport = flights.dimension(function(d) { return d.Airport2; }),
			airline = flights.dimension(function(d) { return d.Airline; }),
			date = flights.dimension(function(d) { return d.DateTime; }),
			hour = flights.dimension(function(d) { return d.DateTime.getHours(); }),
			// Create combined dimension of time of day and delay
			scatter = flights.dimension(function(d) { return [
				// Retrieve time of day and add grouped minutes (5-minute clusters)
				d.DateTime.getHours() + cluster(d.DateTime.getMinutes(),5)/60,
				// Add the delay (limited as to avoid extreme values)
				limit(d.Delay, DELAY_MIN, DELAY_MAX)
			]; }),
			// Create dimension by weekday (week beginning with Monday)
			weekday = flights.dimension(function(d) {
				// Change Sunday's position from 0 to 7
				var adjustedNum = (d.DateTime.getDay() == 0) ? 7 : d.DateTime.getDay();
				return '' + adjustedNum + ' ' + d3.time.format('%A')(d.DateTime);
			}),
			// Create dimension by delay (limited as to avoid extreme values)
			delay = flights.dimension(function(d) {
				return limit(d.Delay, DELAY_MIN, DELAY_MAX);
			}),
			// Create dimension by distance (limited as to avoid extreme values)
			distance = flights.dimension(function(d) {
				return limit(d.Distance, 0, DISTANCE_MAX)
			});

	// Define crossfilter groups
	byDate = date.group(d3.time.day),
	byDateHour = date.group(d3.time.hour),
	byHour = hour.group(),
	byScndAirport = scndAirport.group(),
	byScatter = scatter.group(),
	byDelay = delay.group(function(d) { return cluster(d, 5); }),
	byDistance = distance.group(function(d) { return cluster(d, 100); }),
	// Define own reduce functions as to calculate averages
	byWeekday = weekday.group().reduce(
		function(p, v) { // If element added
			++p.n;
			p.sumDelay += Number(v.Delay);
			p.avgDelay = p.n ? p.sumDelay / p.n : 0;
			return p;
		},
		function(p, v) { // If element removed
			--p.n;
			p.sumDelay -= Number(v.Delay);
			p.avgDelay = p.n ? p.sumDelay / p.n : 0;
			return p;
		},
		function() { // If element created
			return { n: 0, sumDelay: 0, avgDelay: 0 };
		}
	),
	averageDelay = flights.groupAll().reduce(
		function(p, v) { // If element added
			++p.n;
			p.sumDelay += Number(v.Delay);
			return p;
		},
		function(p, v) { // If element removed
			--p.n;
			p.sumDelay -= Number(v.Delay);
			return p;
		},
		function() { // If element created
			return { n: 0, sumDelay: 0 };
		}
	);


	/* Part 2a - DC.js Charting */

	// Define minimum and maximum date range present in data
	var minDate = d3.time.day(date.bottom(1)[0].DateTime),
			lastDay = d3.time.day(date.top(1)[0].DateTime),
			// Adjust last date to be the following day at 00:00
	 		maxDate = lastDay.setDate(lastDay.getDate() + 1);

	// Global reset button over all dimensions
	dc.dataCount('#resetAll')
	.dimension(flights)
	.group(all)
	.html({	some: '<a class=\'btn btn-default btn-block\'><i class=\'fa fa-chain-broken\'></i> Reset All</a>',
		all:'<a class=\'btn btn-block btn-default disabled\'><i class=\'fa fa-chain-broken\'></i> Reset All</a>' });

	// Total flight count (non-graph data representation)
	dc.dataCount('#flights')
	.dimension(flights)
	.group(all)
	.html({ some:'Total Flights: <strong>%filter-count</strong><small>/%total-count</small>',
		all:'Total Flights: <strong>%filter-count</strong><small> (all)</small>' });

	// Total average delay (non-graph data representation)
	totalAverageDelay
	.group(averageDelay)
	.formatNumber(precisionFormat)
	.valueAccessor(function(d) {
		// Return average delay if any flights are present
		return d.n ? d.sumDelay / d.n : 0;
	});

	// Define settings for 'Number of Flights' area chart
	movementsChart
	.clipPadding(10) // Avoid data-points being directly on chart's border
	.renderArea(true) // Area chart
	.height(CHART_L - 50)
	.margins({top: 5, right: 30, bottom: 20, left: 25})
	.dimension(date)
	.group(byDateHour)
	.mouseZoomable(true) // Enable zooming in and out
	.elasticY(true)
	.x(d3.time.scale().domain([minDate, maxDate])) // Show data within date range
	.renderHorizontalGridLines(true)
	.rangeChart(movementsTimeChart) // Bind x-axis range to movementsTimeChart
	.brushOn(false);

	// Reduce number of ticks on both axes (functions are not chain-able)
	movementsChart.xAxis().ticks(4);
	movementsChart.yAxis().ticks(6);

	// Define settings for 'Number of Flights' bar chart
	movementsTimeChart
	.height(36)
	.margins({top: 0, right: 30, bottom: 17, left: 25})
	.dimension(date)
	.group(byDate)
	.elasticY(true)
	.x(d3.time.scale().domain([minDate, maxDate])) // Show data within date range
	.xUnits(d3.time.days) // One bar per day
	.round(d3.time.day.round) // Filter snaps to full days
	.xAxis().ticks(d3.time.days);

	// Define settings for 'Delay by Time of Day' scatter plot
	flightDelay
	.height(CHART_L - 9)
	.margins({top: 5, right: 30, bottom: 20, left: 25})
	.clipPadding(10) // Avoid data-points being directly on chart's border
	.dimension(scatter)
	.group(byScatter)
	.symbolSize(4) // Size of singular dots
	.y(d3.scale.linear().domain([DELAY_MIN, DELAY_MAX + 1]))
	.x(d3.scale.linear().domain([0, 24]))
	.renderHorizontalGridLines(true);
	flightDelay.yAxis().ticks(6);

	// Define settings for 'Connections' row chart
	airportsChart
	.height(CHART_L)
	.margins({top: 0, right: 25, bottom: 17, left: 5})
	.dimension(scndAirport)
	.group(byScndAirport)
	.rowsCap(9) // Show only top 9 connections
	.elasticX(true)
	.ordering(function(d) { return -d.value; }) // Descending sorting by value
	.xAxis().ticks(3);

	// Define settings for 'Day of Week' row chart
	weekdayChart
	.height(CHART_L)
	.margins({top: 0, right: 25, bottom: 17, left: 5})
	.dimension(weekday)
	.group(byWeekday)
	// Select value to be illustrated, as group contains multiple values
	.valueAccessor(function(d) { return d.value.avgDelay; })
	.elasticX(true)
 // Hide number in front of weekday name (number required for correct ordering)
	.label(function (d) { return d.key.split(' ')[1]; })
	.xAxis().ticks(3);

	// Define settings for 'Delay Length' bar chart
	delayChart
	.height(CHART_S)
	.margins({top: 0, right: 25, bottom: 17, left: 10})
	.dimension(delay)
	.group(byDelay)
	.elasticY(true)
	.x(d3.scale.linear().domain([DELAY_MIN, DELAY_MAX + 1]))
	.xUnits(function(){ return (DELAY_MAX - DELAY_MIN) / 5; })
	.round(function(n) { return cluster(n, 5); });

	// Define settings for 'Time of Day' bar chart
	todChart
	.height(CHART_S)
	.margins({top: 0, right: 25, bottom: 17, left: 5})
	.dimension(hour)
	.group(byHour)
	.elasticY(true)
	.x(d3.scale.linear().domain([0, 24]))
	.round(dc.round.floor);

	// Define settings for 'Flight Distance' bar chart
	distanceChart
	.height(CHART_S)
	.margins({top: 0, right: 30, bottom: 17, left: 5})
	.dimension(distance)
	.group(byDistance)
	.elasticY(true)
	.x(d3.scale.linear().domain([0, DISTANCE_MAX + 1]))
	.xUnits(function(){ return DISTANCE_MAX / 100; })
	.round(function(n) { return cluster(n, 100); })
	.xAxis().ticks(6);

	// Format information labels (shown upon hover over a data point)
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

	// Add reset button handlers to all reset-able charts
	resetableCharts = [
		movementsTimeChart,
		flightDelay,
		airportsChart,
		weekdayChart,
		todChart,
		delayChart,
		distanceChart
	];

	resetableCharts.forEach(function(chart) {
		// Each time a chart is redrawn, check if filter on this chart is active
		chart.on('preRedraw', function(chart, filter) { checkReset(chart); });

		// Upon chart's reset button, reset chart and redraw whole dashboard
		$('#reset' + chart.anchorName()).click(function() {
			chart.filterAll();
			dc.redrawAll();
		});
	});

	/**
	 * Check if chart has applied filters and adjust reset button state.
	 * @param  {Object} chart The DC.js chart to be checked.
	 */
	function checkReset(chart) {
		var name = chart.anchorName();
		if ($('#' + name + ' > .reset').css('display') != 'none') // Filter active
			$('#reset' + name).removeClass('disabled');
		else // No filter active
			$('#reset' + name).addClass('disabled');
	};

	// Define settings of 'Latest Flights' table
	flightsTable
	.size(20)
	.dimension(airline)
	.group(function (d) { return d3.time.format('%d %B %Y')(d.DateTime) })
	// Define table columns
	.columns([
		{
			// Time in hours and minutes
			label: 'Time',
			format: function (d) { return d3.time.format('%H:%M')(d.DateTime) }
		},
		{
			// Flight delay with colored minutes of delay
			label: 'Delay',
			format: function (d) {
				if (d.Delay > 0)
					return '<span style=\'color:' + colorRange[0] + ';\'>+' 
						+ d.Delay + ' min</span>';
				else
					return '<span style=\'color:' + colorRange[colorRange.length - 1] 
						+ ';\'>' + d.Delay + ' min</span>';
			}
		},
		{
			// Origin airport
			label: 'Origin',
			format: function (d) {
				if (d.Inbound == 1)
					return d.Airport2;
				else return d.Airport;
			}
		},
		{
			// Destination airport
			label: 'Destination',
			format: function (d) {
				if (d.Inbound != 1)
					return d.Airport2;
				else return d.Airport;
			}
		},
		{
			// Airline
			label: 'Airline',
			format: function (d) { return d.Airline; }
		},
		{
			// Flight distance in miles formatted with thousands separator
			label: 'Distance',
			format: function (d) { return d3.format('0,000')(d.Distance) + ' miles'; }
		},
		{
			// In- (Arrival) or outbound (Departure) flight
			label: 'Type',
			format: function (d) { 
				if (d.Inbound == 1)
					return 'Arrival';
				else
					return 'Departure';
			}
		},
	])
	// Sort table by time (newest first) and correct table order upon filtering
	.sortBy(function(d) { return -d.DateTime; }) 
	.on('postRender', function(chart) { correctTableOrder(chart); })
	.on('postRedraw', function(chart) { correctTableOrder(chart);	});

	/**
	 * DC.js orders individual rows correctly, yet not groups of rows (e.g. all 
	 * flights of a single day are ordered correctly, the days are in reverse 
	 * order). This function corrects the ordering of row groups.
	 * @param  {Object} chart The DC.js chart/table
	 */
	function correctTableOrder(chart) {
		var table =	$('#' + chart.anchorName());
		var tbodies = table.children('tbody');
		table.append(tbodies.get().reverse());
	};

	/**
	 * Retrieve current chart widths and render charts accordingly.
	 */
	function renderCharts() {
		// Retrieve available space for charts via HTML DOM
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
	};


	/* Part 2b - DC.js jQuery event handling */

	// Render charts upon page load
	$(document).ready(renderCharts());

	// Activate global reset button
	$('#resetAll').on('click', function() {
		// Reset all DC.js chart filters
		dc.filterAll();

		// Reset airport selection
		$('#airportSelect').val('ALL');
		airport.filterAll();

		// Reset airport selection
		$('#airlineSelect').val('ALL');
		airline.filterAll();

		// Redraw all DC.js charts without filters
		dc.redrawAll();
	});

	// Render charts upon page resize
	$(window).resize(function() {
		renderCharts();
	});

	// Activate airport selection menu
	$('#airportSelect').on('change', function() {
		if (this.value == 'ALL')
			airport.filterAll();
		else
			airport.filter(this.value);
		dc.redrawAll();
	});

	// Activate airline selection menu
	$('#airlineSelect').on('change', function() {
		if (this.value == 'ALL')
			airline.filterAll();
		else
			airline.filter(this.value);
		dc.redrawAll();
	});

	// Activate color indication for 'Delay by Time of Day' scatter plot
	var colors = false;
	$('#colourflightDelay').on('click', function() {
		$(this).find('i').toggle();

		// Toggle between colorRange and default color
		if (!colors) {
			flightDelay.colors(colorRange)
			flightDelay.colorDomain([90, 0]) // Switched, so that low is green
			flightDelay.colorAccessor(function (d) { return d.key[1]; })
			colors = true;
		} else {
			flightDelay.colors(d3.scale.category10().range()[0]); // standard blue
			colors = false;
		}

		// Redraw re-colored scatter plot
		flightDelay.redraw();
	});


	/* Part 3a - CrossCompare settings */

	// Define CrossCompare settings and add comparable charts
	crosscompare
	.setHeight(500) // Set comparison chart height
	.setDateFormat('%d/%m %Hh') // Set date output and input format
	.addLegend('#airportSelect') // Add airport selection as legend entry
	.addLegend('#airlineSelect') // Add airline selection as legend entry
	.addLegend(movementsTimeChart) // Add time frame as legend entry
	.addLegend(airportsChart, 'Airports') // Add connections as labeled entry
	.addLegend(delayChart, 'Delay') // Add delay as labeled entry
	// Make 'Number of Flights' area chart comparable, with y-axis label
	.add(movementsChart, { type: 'area', yLabel: 'Flights per Hour' })
	// Make 'Connections' row chart comparable, as bar chart in descending order 
	// and with labeled axes
	.add(airportsChart, { type: 'bar', order: 'desc',
		yLabel: 'Flights', xLabel: 'Connected Airports' })
	// Make 'Day of Week' row chart comparable, as bar chart with specified value
	// to be illustrated and with labeled axes
	.add(weekdayChart, { type: 'bar', value: 'avgDelay',
		yLabel: 'Average Delay', xLabel: 'Day of Week' })
	// Make 'Delay Length' bar chart comparable, as bar chart with specified bar
	// width ratio and with labeled axes
	.add(delayChart, { type: 'bar', ratio: 0.2, yLabel: 'Flights',
		xLabel: 'Delay (min)' })
	// Make 'Time of Day' bar chart comparable, as bar chart with specified bar
	// width ratio and with labeled axes
	.add(todChart, { type: 'bar', ratio: 0.4, yLabel: 'Flights',
		xLabel: 'Time of Day (hour)' })
	// Make 'Flight Distance' bar chart comparable, as bar chart with specified 
	// bar width ratio and with labeled axes
	.add(distanceChart, { type: 'bar', ratio: 0.4, yLabel: 'Flights',
		xLabel: 'Distance (miles)' });


	/* Part 3b - CrossCompare jQuery event handling */

	// Show CrossCompare status text upon caching
	$('.openCross').on('click', function() {
		$('#crosscompareInfo').slideDown('fast');
	});

	// Hide CrossCompare status text upon closing status box
	$('.closeCross').on('click', function() {
		$('#crosscompareInfo').slideUp('fast');
	});

	// Show comparison chart upon button press (calculate comparison chart width)
	$('.maxCrossCompare_open').on('click', function() { 
		var width = $(window).width() * 0.78;
		crosscompare.setWidth(width).render();
	});

	// Animate the appearance of the comparison chart
	$('#maxCrossCompare').popup({ transition: '0.2s all 0.1s' });

	// Reset CrossCompare upon closing the comparison chart animation
	$('.resetCrossCompare').on('click', function() {
		crosscompare.clear();
	});
});


/* Part 4 - Information tool-tips */

// Define tool-tip settings and activate 'Number of FLights' tool-tip
var infoOptions = {
	type: 'tooltip',
	vertical: 'bottom',
	horizontal: 'right',
	offsetleft: -35,
	transition: '0.3s all 0.1s',
	closeelement: '.info_close',
	tooltipanchor: $('.infoMovementsChart_open')
};
$('#infoMovementsChart').popup(infoOptions);

// Change tool-tip settings and activate 'Delay by Time of Day' tool-tip
infoOptions.horizontal = 'left';
infoOptions.offsetleft = 25;
infoOptions.tooltipanchor = $('.infoflightDelay_open');
$('#infoflightDelay').popup(infoOptions);

// Change tool-tip settings and activate 'Delay Length' tool-tip
infoOptions.vertical = 'top';
infoOptions.tooltipanchor = $('.infoDelayChart_open');
$('#infoDelayChart').popup(infoOptions);

// Change tool-tip settings and activate 'Time of Day' tool-tip
infoOptions.tooltipanchor = $('.infoTodChart_open');
$('#infoTodChart').popup(infoOptions);

// Change tool-tip settings and activate 'Flight Distance' tool-tip
infoOptions.tooltipanchor = $('.infoDistanceChart_open');
$('#infoDistanceChart').popup(infoOptions);

// Change tool-tip settings and activate 'Connections' tool-tip
infoOptions.horizontal = 'right';
infoOptions.offsetleft = -25;
infoOptions.tooltipanchor = $('.infoairportsChart_open');
$('#infoairportsChart').popup(infoOptions);

// Change tool-tip settings and activate 'Day of Week' tool-tip
infoOptions.tooltipanchor = $('.infoWeekdayChart_open');
$('#infoWeekdayChart').popup(infoOptions);