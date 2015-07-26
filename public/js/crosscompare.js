



var crosscompare = {
	height: 200, // default
	width: 200, // default
	anchor: '#crosscompare', // default
	flash: true, // default
	chart: {},
	charts: {},
	queue: []
};

crosscompare.setHeight = function(height) {
	if (height >= 0)
		this.height = height;
	return this;
};

crosscompare.setWidth = function(width) {
	if (width >= 0)
		this.width = width;
	return this;
};

crosscompare.setAnchor = function(anchor) {
	if (typeof anchor !== 'undefined' && anchor.length > 0)
		this.anchor = anchor;
	return this;
};

crosscompare.setFlash = function(active) {
	if (typeof active === 'boolean')
		this.flash = active;
	return this;
}

crosscompare.add = function(chart, type) {

	var anchor = chart.anchor() + '-cross';
	// add chart to charts with given name
	this.charts[anchor] = { 'chart': chart, 'type': type};

	// render crosscompare chart if anchor clicked
	$(anchor).on('click', function() {
		// flashing animation (10 ms -> 700 ms)
		if (crosscompare.flash)
			$(chart.anchor()).fadeTo(10, 0.3).fadeTo(700, 1.0);

		var text = 'You have cached ';
		if ($.isEmptyObject(crosscompare.chart)) // nothing so far
			text += '1 state.';
		else if (crosscompare.chart.source == chart) // added same chart
			text += (crosscompare.queue.length + 1) + ' states.';
		else { // added smth else
			crosscompare.reset();
			text = 'Overwritten with new state.'
		}

		// fill active as to signal that a crosscompare has been created
		crosscompare.chart.source = chart;

		$('#crosscompareInfoTxt').text(text);

		crosscompare.cache(chart);
		
	});

	return this;
};

crosscompare.cache = function(chart) {
	// retrieve filter for naming the categorization
	//var name = chart.filters();
	var name = Math.random();

	// retrieve data filters and filter cache
	var filters = chart.filters()[0];

	// cache the charts underlying data (deep copy)
	var cache = $.extend(true, [], chart.group().all());

	$.each(cache, function(i, val) {
		if (typeof filters !== 'undefined' && // if there is a filter,
			((filters.length == 1 // check if single filter,
				&& val.key != filters[0]) // if data does not equal filter -> remove;
			|| (filters.length == 2 // check if range filter,
				&& (val.key < filters[0] || val.key > filters[1]) // if data out of range -> remove;
			))) {

			val[name] = null;
			delete val.value;

		} else {
			// in multi-value groups, read out correct value?  <----------------------ERROR
			val[name] = val.value;
			delete val.value;
		}
	});

	this.queue.push({ id: name, datapoints: cache});
};

crosscompare.reset = function() {
	this.chart = {};
	this.queue = [];
};

crosscompare.render = function() {

	var anchor = this.chart.source.anchor() + '-cross';

	var first = true;

	// retrieve chart type
	var chartType = crosscompare.charts[anchor].type;

	var globalMin, globalMin;

	$.each(crosscompare.queue, function(i, item) {

		var cache = item.datapoints;

		var n = cache[0].key,
				isDate = n instanceof Date,
				isNumber = !isNaN(parseFloat(n)) && isFinite(n);

		var min, max, axisRange;
		if (isDate || isNumber) {
			// find min
			for (i = 0; i < cache.length; i++) {
				if (cache[i][item.id] != null) {
					min = cache[i].key;
					break;
				}
			};
			// find max
			for (i = cache.length -1; i >= 0; i--) {
				if (cache[i][item.id] != null) {
					max = cache[i].key;
					break;
				}
			};

			if (!first) {
				min = Math.min(min, globalMin);
				max = Math.max(max, globalMax);
			}

			globalMin = min;
			globalMax = max;
		}

		// if no chart rendered or chart rendered is not the one to be rendered
		if (first) {

			var options = {
				bindto: crosscompare.anchor,
				size: { height: crosscompare.height, width: crosscompare.width },
				padding: { top: 0, right: 0, bottom: 0, left: 0 },
				data: { json: cache, keys: { x: 'key', value: [item.id] }, types: { value: [item.id] } },
				zoom: { enabled: true }
			};

			if (isDate || isNumber) {

				console.log('isses date?');console.log(isDate);
				console.log(cache);

				options.axis = { x: {
					tick: { fit: false },
					min: globalMin,
					max: globalMax
				} };

				if (isDate) { // this style otherwise overwriting upper
					options.axis.x.type = 'timeseries';
					options.axis.x.tick.format = '%d/%m/%Y';
				}
			} else { // Category
				options.axis = { x: { type: 'category' } };
			}

			if (chartType != 'line')
				options.data.type = chartType;

			if (chartType == 'bar') { // <-------------------------- make responsive
				options.bar = { width: { ratio: 0.2 } };
			}

			// make available later (see below)
			crosscompare.chart.rendered = c3.generate(options);
			first = false;

		} else {

			var options = {
				json: cache,
				keys: { x: 'key', value: [item.id] }
			};

			// if line, no change required, otherwise
			if (chartType != 'line')
				options.type = chartType;

			// Update chart range
			crosscompare.chart.rendered.axis.range({ min: {x: globalMin}, max: {x: globalMax} });

			// load additional data
			crosscompare.chart.rendered.load(options);

		}
	});
};

// Node.js export
if (typeof exports !== 'undefined'){ module.exports = crosscompare };