// Load data from csv file
//d3.csv("/data/flightsDec08.csv", function(data) {
d3.csv("/data/MINI.csv", function(data) {

	// Define charts
	var movementsChart = dc.lineChart('#movements-chart'),
			movementsTimeChart = dc.barChart('#movements-time-chart'),
			carrierChart = dc.rowChart('#carrier-chart'),
			delayChart = dc.barChart('#delay-length-chart');

	// Parse dates and times from .csv
	var dateFormat = d3.time.format('%d-%m-%Y'),
			timeFormat = d3.time.format('%H:%M');

	data.forEach(function (d) {
		d.DDMMYYYY = dateFormat.parse(d.DDMMYYYY);
	});

	// Set up crossfilter
	var flights = crossfilter(data),
			all = flights.groupAll();

	// Define dimensions
	var date = flights.dimension(function(d) { return d.DDMMYYYY; }),
			airport = flights.dimension(function(d) { return d.Airport; }),
			delay = flights.dimension(function(d) { return d.ArrDelay; }),
			carrier = flights.dimension(function(d) { return d.Carrier; });

	// Define groups (reduce to counts)
	var byDate = date.group(),
			byAirport = airport.group(),
			byDelay = delay.group(),
			byCarrier = carrier.group();

	// Date range
	var minDate = date.bottom(1)[0].DDMMYYYY,
			maxDate = date.top(1)[0].DDMMYYYY;

	// Delay range
	var minDelay = -40,
			maxDelay = 90;

	dc.dataCount('#flights')
	.dimension(flights)
	.group(all)
	.html({
		some:'%filter-count/<small>%total-count</small>',
		all:'%total-count'
	});

	// Define charts properties
	movementsChart
	.renderArea(true)
	.height(300)
	.margins({top: 10, right: 40, bottom: 30, left: 40})
	.dimension(date)
	.group(byDate)
	.elasticY(true)
	.x(d3.time.scale().domain([minDate, maxDate]))
	.renderHorizontalGridLines(true)
	.xUnits(d3.time.days)
	.mouseZoomable(false)
	.yAxis().ticks(7);

	movementsTimeChart
	.height(40)
	.margins({top: 0, right: 40, bottom: 20, left: 40})
	.dimension(date)
	.group(byDate)
	.centerBar(true)
	.elasticY(true)
	.x(d3.time.scale().domain([minDate, maxDate]))
	.xUnits(d3.time.days)
	.gap(1)
	.yAxis().ticks(0);

	carrierChart
	.height(300)
	.margins({top: 0, right: 30, bottom: 20, left: 5})
	.dimension(carrier)
	.group(byCarrier)
	.ordering(function(d){ return -d.value }) // biggest on top
	.elasticX(true)
	.xAxis().ticks(5);

	delayChart
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

	// Update chart widths
	renderCharts = function () {
		// Retrieve available space for charts via DOM
		var movementsChartWidth = $('#movements-chart-width').width(),
				carrierChartWidth = $('#carrier-chart-width').width(),
				delayChartWidth = $('#delay-length-chart-width').width();

		// Set chart widths
		movementsChart.width(movementsChartWidth);
		movementsTimeChart.width(movementsChartWidth);
		carrierChart.width(carrierChartWidth);
		delayChart.width(delayChartWidth);

		// Render all charts (update)
		dc.renderAll();
	};

	// Render charts upon page load
	renderCharts();


	// JQUERY

	// Render charts upon page resize
	$(window).resize(function() {
		dc.filterAll(); // Reset filters as filters are not re-sizable
		renderCharts(); // Re-render charts
	});

	// Airport selection menu
	$('#airport-select').on('change', function() {
		if (this.value == 'ALL') airport.filterAll();
		else airport.filter(this.value);
		dc.redrawAll();
	});





	$('#reset-compare').on('click', function() {
		$('#comparison-dropbox').show();
		$('#comparison-chart').hide();
	});

	// Graph test

	$('#test').on('click', function() {

		var cache = jQuery.extend(true, [], byDate.top(Infinity));

		var name = $('#airport-select').val() + carrierChart.filters();

		jQuery.each(cache, function(i, val) {
			val[name] = val.value;
			delete val.value;
		});



		if ($('#comparison-dropbox').is(":visible")) {

			$('#comparison-dropbox').hide();
			$('#comparison-chart').show();

			chart = c3.generate({
				bindto: '#comparison-chart',
				size: { height: 120 },
				padding: { top: 0, right: 0, bottom: 0, left: 0 },
				data: {
					json: cache,
					keys: { x: 'key', value: [name] },
					types: { value: [name] }
				},
				axis: {
					x: { type: 'timeseries', tick: { format: '%d.' }	}
				}
			});
		} else {
			chart.load({
				json: cache,
				keys: { x: 'key', value: [name] }
			});
		}
	});

	$('#test2').on('click', function() {

		// different group!
		var cache = jQuery.extend(true, [], byCarrier.top(Infinity));

		var name = $('#airport-select').val();

		jQuery.each(cache, function(i, val) {
			val[name] = val.value;
			delete val.value;
		});

		if ($('#comparison-dropbox').is(":visible")) {

			$('#comparison-dropbox').hide();
			$('#comparison-chart').show();

			chart = c3.generate({
				bindto: '#comparison-chart',
				bar: { width: { ratio: 0.5 } }, // or width: 100 
				size: { height: 120 },
				padding: { top: 0, right: 0, bottom: 0, left: 0 },
				data: {
					json: cache,
					keys: { x: 'key', value: [name] },
					types: { value: [name] },
					type: 'bar'
				},
				axis: {
					// CAHNGEd TYPE
					x: { type: 'category'	}
				}
			});
		} else {
			chart.load({
				json: cache,
				keys: { x: 'key', value: [name] },
				types: { value: [name] },
				type: 'bar'
			});
		}
	});

	$('#test3').on('click', function() {
		console.log(carrierChart.filters());
		// different group!
		var cache = jQuery.extend(true, [], byDelay.top(Infinity));

		var name = $('#airport-select').val() + carrierChart.filters();

		jQuery.each(cache, function(i, val) {
			val[name] = val.value;
			delete val.value;
		});

		if ($('#comparison-dropbox').is(":visible")) {

			$('#comparison-dropbox').hide();
			$('#comparison-chart').show();

			chart = c3.generate({
				bindto: '#comparison-chart',
				// bar: { width: { ratio: 1 } }, // or width: 100 
				size: { height: 120 },
				padding: { top: 0, right: 0, bottom: 0, left: 0 },
				data: {
					json: cache,
					keys: { x: 'key', value: [name] },
					types: { value: [name] },
					type: 'scatter' //dasdasdasdasd
				},
				axis: {
						x: {tick: {fit: false}, label: 'Arrival Delay in Minutes' }
				}
				// axis: { x: { tick: { count: 10 } } }
				// axis: {
				// 	// CAHNGEd TYPE
				// 	x: { type: 'category'	}
				// }

			});
		} else {
			chart.load({
				json: cache,
				keys: { x: 'key', value: [name] },
				types: { value: [name] },
				type: 'scatter' //dasdasdasdasd
			});
		}
	});
});