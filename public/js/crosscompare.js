
/*!
 *  Font Awesome 4.3.0 by @davegandy - http://fontawesome.io - @fontawesome
 *  License - http://fontawesome.io/license (Font: SIL OFL 1.1, CSS: MIT License)
 */


var crosscompare = {
	// Setting variables (with default values)
	height: 200,
	width: 'auto',
	padding: { top: 20, right: 5, bottom: 10, left: 25 },
	anchor: '#crosscompare',
	dateFormat: '%d/%m/%Y',
	overwrite: false,
	xGrid: false,
	yGrid: false,
	flash: true,
	legends: [],

	// Operational variables
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
	if (width >= 0 || width == 'auto')
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
		'ratio': 0.5,
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
			crosscompare.clear();
			text = 'Overwritten with new state.'
		}

		// fill active as to signal that a crosscompare has been created
		crosscompare.chart.source = chart;

		$(crosscompare.anchor + '-info').text(text);

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

					if (item.title != '')
						legend += item.title + ':';

					if (filters[0].constructor === Array) {

						if (filters[0][0] instanceof Date)
							legend += format(filters[0][0]) + ' - ' + format(filters[0][1]);
						else
							legend += filters[0][0] + ' - ' + filters[0][1];
					} else
						legend += filters + ' ';
				}
			}
		});

		// Prevent empty legend in case legends have been provided but no filters
		if (legend == '')
			legend = 'ALL ';

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
	var chart = crosscompare.chart.rendered;
	if (typeof chart !== 'undefined')
		chart.destroy();

	crosscompare.clear();
};

crosscompare.clear = function () {
	$(crosscompare.anchor + '-info').text('Cache cleared.');
	this.chart = {};
	this.queue = [];
}

crosscompare.render = function() {

	// http://stackoverflow.com/questions/881510/sorting-json-by-values
	function sort(array, key, asc) {
		array = array.sort(function(a, b) {
			if (asc) return (a[key] > b[key]) ? 1 : ((a[key] < b[key]) ? -1 : 0);
			else return (b[key] > a[key]) ? 1 : ((b[key] < a[key]) ? -1 : 0);
		});
	}

	if (this.queue.length > 0) { // if queued data exists

		// retrieve chart type
		var anchor = this.queue[0].anchor,
				type = this.charts[anchor].type,
				order = this.charts[anchor].order,
				yLabel = this.charts[anchor].yLabel,
				xLabel = this.charts[anchor].xLabel;

		var globalMin, globalMax;
		
		var orderBy = this.queue[0].id, // always sort by first dimension
				n = this.queue[0].data[0].key,
				isDate = n instanceof Date,
				isNumber = !isNaN(parseFloat(n)) && isFinite(n);

		var testo = [], typeso = [];

		$.each(crosscompare.queue, function(index, item) {

			var cache = item.data;

			typeso.push(item.id);

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

				// if not in first run
				if (index != 0) {
					min = Math.min(min, globalMin);
					max = Math.max(max, globalMax);
				}

				globalMin = min;
				globalMax = max;
			}

			// combine all caches
			$.extend(true, testo, cache);
		});

		if (order != 'default') {
			if (order == 'asc')
				sort(testo, orderBy, true);
			else
				sort(testo, orderBy, false);
		}

		var options = {
			bindto: crosscompare.anchor,
			size: { height: crosscompare.height },
			padding: crosscompare.padding,
			data: { json: testo, keys: { x: 'key', value: typeso } }, // CHANGE ALL TO TYPESO
			zoom: { enabled: true },
			color: { pattern: d3.scale.category10().range() }
		};

		if (crosscompare.legends.length == 0) 
			options.legend = { show: false };

		if (crosscompare.width != 'auto')
			options.size.width = crosscompare.width;

		if (isDate || isNumber) {

			options.axis = { x: {
				tick: { fit: false },
				min: Number(globalMin),
				max: Number(globalMax)
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
			options.bar = { width: { ratio: this.charts[anchor].ratio } };

		options.grid = {
			x: { show: crosscompare.xGrid },
			y: { show: crosscompare.yGrid }
		}

		if (yLabel != '')
			options.axis.y = { label: yLabel };					

		if (xLabel != '')
			options.axis.x.label = xLabel; // other format than y axis, otherwise overwrite of x

		// make available later (see below)
		crosscompare.chart.rendered = c3.generate(options);

	} else $(crosscompare.anchor + '-info').text('Nothing cached.');
};

// Node.js export
if (typeof exports !== 'undefined'){ module.exports = crosscompare };