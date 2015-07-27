



var crosscompare = {
	// Settings
	height: 200, // default
	width: 200, // default
	padding: { top: 20, right: 5, bottom: 10, left: 25 }, // default
	anchor: '#crosscompare', // default
	dateFormat: '%d/%m/%Y', // default
	overwrite: false, // default
	xGrid: false, // default
	yGrid: false, // default
	flash: true, // default
	legends: [], // default

	// Operational
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

crosscompare.setPadding = function(top, right, bottom, left) {
	if (typeof top === 'number' && typeof right === 'number' &&
		typeof bottom === 'number' &&	typeof left === 'number')
		this.padding = { top: top, right: right, bottom: bottom, left: left};
	return this;
}

crosscompare.setAnchor = function(anchor) {
	if (typeof anchor !== 'undefined' && anchor.length > 0)
		this.anchor = anchor;
	return this;
};

crosscompare.setDateFormat = function(format) {
	if (typeof format !== 'undefined' && format.length > 0)
		this.dateFormat = format;
	return this;
};

crosscompare.setOverwrite = function(overwrite) {
	if (typeof overwrite === 'boolean')
		this.overwrite = overwrite;
	return this;
}

crosscompare.setGrid = function(xGrid, yGrid) {
	if (typeof xGrid === 'boolean' && typeof yGrid === 'boolean') {
		this.xGrid = xGrid;
		this.yGrid = yGrid;
	}
	return this;
}

crosscompare.setFlash = function(active) {
	if (typeof active === 'boolean')
		this.flash = active;
	return this;
}

crosscompare.addLegend = function(legend, title) {
	if (typeof legend !== 'undefined')
		this.legends.push({ 'legend': legend, 'title': (title ? title : '') });
	return this;
}

crosscompare.add = function(chart, options) {

	// options: type, value, anchor, order, yLabel, xLabel
	var allOptions = {
		'chart': chart,
		'type': 'line',
		'value': 'default',
		'anchor': chart.anchor() + '-cross',
		'order': 'default',
		'yLabel': '',
		'xLabel': ''
	};

	if(typeof options !== 'undefined')
		$.each(options, function(key, value) {
			allOptions[key] = value;
		});

	var anchor = allOptions.anchor;

	this.charts[anchor] = allOptions;

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

		crosscompare.cache(anchor);
		
	});

	return this;
};

crosscompare.cache = function(anchor) {

	var legend = '';

	if (this.legends.length == 0) // no legend specified
		legend += (this.queue.length + 1);
	else {
		$.each(this.legends, function(i, item) {

			if (typeof item.legend === 'string') { // string --> legend via html selection
				if (item.title != '')	legend += item.title + ':';
				legend += $(item.legend).val() + ' ';
			} else { // chart --> legend via filter

				var filters = item.legend.filters(),
						format = d3.time.format(crosscompare.dateFormat)

				if (typeof filters !== 'undefined' && filters.length > 0) {

					if (item.title != '')	legend += item.title + ':';

					if (filters[0].constructor === Array) {

						if (filters[0][0] instanceof Date) {
							legend += '[' + format(filters[0][0]) + ' - ' + format(filters[0][1]) + '] ';
						} else {
							legend += '[' + filters[0][0] + ' - ' + filters[0][1] + '] ';
						}
					} else {
						legend += '[' + filters + '] ';
					}
				}			
			}
		});

		if (!this.overwrite)
			$.each(crosscompare.queue, function(key, value) {
				if (value.id == legend)
					legend += '(' + (crosscompare.queue.length + 1) + ')';
			});
	}

	var chart = this.charts[anchor].chart;
	var value = this.charts[anchor].value;

		// cache the charts underlying data (deep copy)
	var cache = $.extend(true, [], chart.group().all());

	// retrieve data filters and filter cache
	var filters = chart.filters();

	// have to go reverse, as deleting elements from array prob in JS
	var i = cache.length;
	while (i--) {

		// set chosen value if value group
		if (value != 'default')
			cache[i].value = cache[i].value[value];

		if (typeof filters !== 'undefined' && filters.length > 0) {

			if (filters[0].constructor === Array) { // number range as filter
				if (cache[i].key < filters[0][0] || cache[i].key > filters[0][1]) {
					cache[i][legend] = null; // cannot delete, else c3 hover is broken
					delete cache[i].value;
				}
			} else { // filters are actual elements
				if (filters.indexOf(cache[i].key) == -1) {
					cache.splice(i, 1); // delete instead of nulling elements, so it doesn't show up --> categ
					continue; // skip rest of iteration (below) as entry is gone
				}
			}
		}

		// rename as per cat, so c3 can stack values
		cache[i][legend] = cache[i].value;
		delete cache[i].value;
	};

	this.queue.push({ 'anchor': anchor, 'id': legend, 'data': cache});
};

crosscompare.reset = function() {
	this.chart = {};
	this.queue = [];
};

crosscompare.render = function() {

	if (this.queue.length > 0) { // if queued data exists

		// retrieve chart type
		var anchor = crosscompare.queue[0].anchor,
				type = crosscompare.charts[anchor].type,
				order = crosscompare.charts[anchor].order,
				yLabel = crosscompare.charts[anchor].yLabel,
				xLabel = crosscompare.charts[anchor].xLabel;

		var globalMin, globalMin;

		var first = true;

		$.each(crosscompare.queue, function(i, item) {

			var cache = item.data;

			function sort(key, asc) {
				cache = cache.sort(function(a, b) {
					if (asc) return (a[key] > b[key]) ? 1 : ((a[key] < b[key]) ? -1 : 0);
					else return (b[key] > a[key]) ? 1 : ((b[key] < a[key]) ? -1 : 0);
				});
			}

			if (order != 'default') {
				if (order == 'asc') sort([item.id], true);
				else sort([item.id], false);
			}

			var n = cache[0].key,
					isDate = n instanceof Date,
					isNumber = !isNaN(parseFloat(n)) && isFinite(n);

			var min, max;
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
					padding: crosscompare.padding,
					data: { json: cache, keys: { x: 'key', value: [item.id] }, types: { value: [item.id] } },
					zoom: { enabled: true },
					color: { pattern: d3.scale.category10().range() }
				};

				if (isDate || isNumber) {

					options.axis = { x: {
						tick: { fit: false },
						min: globalMin,
						max: globalMax
					} };

					if (isDate) { // this style otherwise overwriting upper
						options.axis.x.type = 'timeseries';
						options.axis.x.tick.format = crosscompare.dateFormat;
					}
				} else { // Category -> overwrites previous axis settings above
					options.axis = { x: { type: 'category' } };
				}

				if (type != 'line')
					options.data.type = type;

				if (type == 'bar')
					// Todo in future: responsive, im moment einfach nur guter mittelwert
					options.bar = { width: { ratio: 0.2 } };

				options.grid = {
					x: { show: crosscompare.xGrid },
					y: { show: crosscompare.yGrid, lines: [ { value: 0, class: 'zero' } ] }
				}

				if (yLabel != '')
					options.axis.y = { label: yLabel };					

				if (xLabel != '')
					options.axis.x.label = xLabel; // other format than y axis, otherwise overwrite of x

				// make available later (see below)
				crosscompare.chart.rendered = c3.generate(options);

				first = false;

			} else {

				var options = {
					json: cache,
					keys: { x: 'key', value: [item.id] }
				};

				// if line, no change required, otherwise
				if (type != 'line')
					options.type = type;

				if (isDate || isNumber)
					// Update chart range
					crosscompare.chart.rendered.axis.range({ min: {x: globalMin}, max: {x: globalMax} });

				// load additional data
				crosscompare.chart.rendered.load(options);

			}
		});

	} else return 'No data queued.';
};

// Node.js export
if (typeof exports !== 'undefined'){ module.exports = crosscompare };