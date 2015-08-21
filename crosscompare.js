/**
 * CrossCompare.js - JavaScript library for quick dc.js chart comparison
 * 
 * Github - https://github.com/RRothfeld/CrossCompare-js
 * MIT License - https://github.com/RRothfeld/CrossCompare-js/blob/master/LICENSE
 *
 * @author RRothfeld
 * @version 1.0.0
 */


/**
 * Object storing CrossCompare's default and users' values.
 * @type {Object}
 */
var crosscompare = {
	// Comparison graph display settings
	height: 200, // in px
	width: 'auto',// in px  or 'auto' (scales to container width)
	padding: { top: 20, right: 5, bottom: 10, left: 25 }, // in px
	anchor: '#crosscompare', // HTML id of container for comparison chart
	dateFormat: '%d/%m/%Y', // format for JavaScript/D3.js dates
	xGrid: false, // show grid-lines along x-axis
	yGrid: false, // show grid-lines along y-axis

	// CrossCompare behavior settings
	flash: true, // lights up cached source chart when caching
	legends: [], // filters and selection defining the naming of cached data
	overwrite: false, // update existing data (true) or add new dimension (false)
										// in case same filters have already been cached

	// Operational variables
	chart: {}, // stores pointers to comparison chart and data-source chart
	charts: {}, // stores pointers to all charts available for comparison
	queue: [] // stores all cached data for simultaneous rendering
};

/** 
 * Set comparison chart height (in px).
 * @param {number} height The desired height of the comparison chart.
 * @return {crosscompare} The crosscompare instance (chain-able).
 */
crosscompare.setHeight = function(height) {
	// Accept height of zero or more pixels
	if (height >= 0)
		this.height = height;
	return this;
};

/** 
 * Set comparison chart width (in px).
 * @param {number/string} width The desired width of the comparison chart.
 * @return {crosscompare} The crosscompare instance (chain-able).
 */
crosscompare.setWidth = function(width) {
	// Accept width of zero or more pixels, or 'auto'
	if (width >= 0 || width == 'auto')
		this.width = width;
	return this;
};

/**
 * Set comparison chart padding (in px).
 * @param {number} top    The desired top-padding of the comparison chart.
 * @param {number} right  The desired right-padding of the comparison chart.
 * @param {number} bottom The desired bottom-padding of the comparison chart.
 * @param {number} left   The desired left-padding of the comparison chart.
 * @return {crosscompare} The crosscompare instance (chain-able).
 */
crosscompare.setPadding = function(top, right, bottom, left) {
	// Accept if all padding sides are provided and are numbers (negative padding
	// is allowed)
	if (typeof top === 'number' && typeof right === 'number' &&
		typeof bottom === 'number' &&	typeof left === 'number')
		this.padding = { top: top, right: right, bottom: bottom, left: left};
	return this;
};

/** 
 * Set comparison chart anchor (HTML id).
 * @param {string} anchor The desired HTML anchor of the comparison chart.
 * @return {crosscompare} The crosscompare instance (chain-able).
 */
crosscompare.setAnchor = function(anchor) {
	// Accept non-empty anchors
	if (typeof anchor !== 'undefined' && anchor.length > 0)
		this.anchor = anchor;
	return this;
};

/** 
 * Set data input and comparison chart output date format.
 * See https://github.com/mbostock/d3/wiki/Time-Formatting
 * @param {string} format The desired date format of the comparison chart.
 * @return {crosscompare} The crosscompare instance (chain-able).
 */
crosscompare.setDateFormat = function(format) {
	// Accept non-empty date formats
	if (typeof format !== 'undefined' && format.length > 0)
		this.dateFormat = format;
	return this;
};

/** 
 * Show or hide comparison chart x- and y-axis grid-lines.
 * @param {boolean} xGrid Show (true) or hide (false) x-axis grid-lines.
 * @param {boolean} yGrid Show (true) or hide (false) y-axis grid-lines.
 * @return {crosscompare} The crosscompare instance (chain-able).
 */
crosscompare.setGrid = function(xGrid, yGrid) {
	// Accept two booleans
	if (typeof xGrid === 'boolean' && typeof yGrid === 'boolean') {
		this.xGrid = xGrid;
		this.yGrid = yGrid;
	}
	return this;
};

/** 
 * Set CrossCompare source-chart flashing behavior.
 * @param {boolean} active The desired behavior for visually indicating caching.
 * @return {crosscompare} The crosscompare instance (chain-able).
 */
crosscompare.setFlash = function(active) {
	// Accept boolean
	if (typeof active === 'boolean')
		this.flash = active;
	return this;
};

/** 
 * Register dc.js chart or HTML selection as name-defining.
 * @param {string/Chart} legend The desired element to be used for the legend.
 * @param {string} title The desired description for this filter (optional).
 * @return {crosscompare} The crosscompare instance (chain-able).
 */
crosscompare.addLegend = function(legend, title) {
	// Accept existing legend element (string or Chart)
	if (typeof legend !== 'undefined')
		this.legends.push({ 'legend': legend, 'title': (title ? title : '') });
	return this;
};

/** 
 * Set CrossCompare overwrite behavior.
 * @param {boolean} overwrite The desired behavior for overwriting (true) or 
 * keeping (false) data upon re-caching.
 * @return {crosscompare} The crosscompare instance (chain-able).
 */
crosscompare.setOverwrite = function(overwrite) {
	// Accept boolean
	if (typeof overwrite === 'boolean')
		this.overwrite = overwrite;
	return this;
};

/**
 * Adds a dc.js chart with CrossCompare for latter comparison.
 * @param {Chart} chart   The to-be-comparable dc.js chart.
 * @param {JSON}  options Desired options for CrossCompare on how to handle this
 *  chart's comparisons (optional).
 * @return {crosscompare} The crosscompare instance (chain-able).
 */
crosscompare.add = function(chart, options) {

	// Stores all options for the provided chart (default or users')
	var allOptions = {
		'chart': chart, // pointer to source-chart
		'type': 'line', // comparison chart type ('line','line-spline','area','bar')
		'ratio': 0.5, // bar-width ratio for type 'bar'
		'value': 'default', // select specific crossfilter group value
		'anchor': chart.anchor() + '-cross', // id of caching link of source-chart
		'order': 'default', // ordering of comparison data ('default','desc','asc')
		'yLabel': '', // label for y-axis
		'xLabel': '' // label for x-axis
	};

	// If user options have been provided, overwrite default values
	if(typeof options !== 'undefined')
		$.each(options, function(key, value) {
			allOptions[key] = value;
		});

	// Retrieve chart's caching anchor
	var anchor = allOptions.anchor;

	// Store the chart's options with the chart's anchor as key (for later lookup)
	this.charts[anchor] = allOptions;

	// Cache source-chart if anchor clicked
	$(anchor).on('click', function() {
		// Flash source-chart if flash option is activated to indicate caching
		if (crosscompare.flash)
			$(chart.anchor()).fadeTo(10, 0.3).fadeTo(700, 1.0);

		// Update CrossCompare status text variable
		var text = 'You have cached ';
		if ($.isEmptyObject(crosscompare.chart)) // First caching
			text += '1 state.';
		else if (crosscompare.chart.source == chart) // Subsequent caching
			text += (crosscompare.queue.length + 1) + ' states.';
		else { // Caching of an incompatible chart resets cache
			crosscompare.clear();
			text = 'Overwritten with new state.'
		}

		// Update CrossCompare status text in HTML page
		$(crosscompare.anchor + '-info').text(text);

		// Store source-chart pointer within CrossCompare
		crosscompare.chart.source = chart;

		// Cache the data of the related chart (identified via anchor)
		crosscompare.cache(anchor);	
	});

	// Return the CrossCompare instance to make this function chain-able
	return this;
};

/**
 * Cache the data of a chart and store it in the queue for later rendering.
 * @param {string} anchor The anchor of the chart.
 */
crosscompare.cache = function(anchor) {

	// Create legend for the cached data
	var legend = '';
	if (this.legends.length == 0) // Enumerate data if no legends defined
		legend += (this.queue.length + 1);
	else {
		// Else, form legend from each defined entry in legends
		$.each(this.legends, function(i, item) {
			// If legend entry is string, handle it as a HTML selection
			if (typeof item.legend === 'string') {
				// If legend entry has description, add legend description
				if (item.title != '')
					legend += item.title + ':';

				// Add legend value
				legend += $(item.legend).val() + ' ';
			} else {
				// Legend entry is DC.js chart with potential filters
				var filters = item.legend.filters(),
						format = d3.time.format(crosscompare.dateFormat);

				// Test if DC.js chart has applied filters
				if (typeof filters !== 'undefined' && filters.length > 0) {
					// If legend entry has description, add legend description
					if (item.title != '')
						legend += item.title + ':';

					// If filters is array, read out filtered range and add to legend
					if (filters[0].constructor === Array) {
						if (filters[0][0] instanceof Date)
							legend += format(filters[0][0]) + ' - ' + format(filters[0][1]) + ' ';
						else
							legend += filters[0][0] + ' - ' + filters[0][1];
					} else
						// Filters is singular value, add to legend
						legend += filters + ' ';
				}
			}
		});

		// An empty legend would result if legends have been added but no filters 
		// applied - in this case, show 'All' as legend
		if (legend == '')
			legend = 'ALL ';

		// If overwrite option has been disabled, enumerate cached data with same 
		// legend as already existing cache
		if (!this.overwrite)
			// Test for duplicate legend
			$.each(crosscompare.queue, function(key, value) {
				if (value.id == legend)
					legend += '(' + (crosscompare.queue.length + 1) + ')';
			});
	}

	// Retrieve chart and the key of the data field
	var chart = this.charts[anchor].chart;
	var value = this.charts[anchor].value;

	// Cache the chart's data (deep copy)
	var cache = $.extend(true, [], chart.group().all());

	// Retrieve chart's own filters to apply those to the data (as the chart's 
	// data is being filtered by crossfilter for all chart-external filters, but 
	// not the chart's own filter)
	var filters = chart.filters();

	// For each element in cache, test if it passes the filters and rename it to 
	// be identified via the legend as the key, otherwise delete
	var i = cache.length;
	while (i--) {
		// Set chosen value if chart's data is a crossfilter group with multiple 
		// values, otherwise take the only value available
		if (value != 'default')
			cache[i].value = cache[i].value[value];

		// If the chart has filters applied, test data
		if (typeof filters !== 'undefined' && filters.length > 0) {
			if (filters[0].constructor === Array) { // Filter is a number range
				if (cache[i].key < filters[0][0] || cache[i].key > filters[0][1])
					// Null value if outside filter range, as to keep x-axis range
					cache[i].value = null;
			} else { // Filter a or multiple specific values
				if (filters.indexOf(cache[i].key) == -1) {
					// Delete instead of null, as to remove category from x-axis
					cache.splice(i, 1);
					continue; // Skip rest of iteration (below) as entry is deleted
				}
			}
		}

		// Rename data field with legend name as to enable C3.js to stack the various 
		// caches, as same names would overwrite existing data
		cache[i][legend] = cache[i].value;
		delete cache[i].value;
	};

	// After a legend for the cached data has been created, and the cache has been
	// filtered, add it to cache with the anchor as identifier
	this.queue.push({ 'anchor': anchor, 'id': legend, 'data': cache});
};

/**
 * Resets the current CrossCompare instance and deletes any rendered comparison 
 * chart.
 */
crosscompare.reset = function() {
	// Destroy comparison chart if it has been rendered
	var chart = crosscompare.chart.rendered;
	if (typeof chart !== 'undefined')
		chart.destroy();

	// Clear CrossCompare's internal data and option stores
	crosscompare.clear();
};

/**
 * Clears the current CrossCompare instance's internal data and option stores.
 */
crosscompare.clear = function () {
	// Update CrossCompare status text in HTML page
	$(crosscompare.anchor + '-info').text('Cache cleared.');

	// Clear internal stores
	this.chart = {};
	this.queue = [];
};

/**
 * Draws the comparison chart showing all cached data.
 */
crosscompare.render = function() {
	
	/**
	 * Sorting function for ordering data according to specified order.
	 * See http://stackoverflow.com/questions/881510/sorting-json-by-values
	 * @param  {Array} array  Data to-be-sorted.
	 * @param  {string} key   The key of which values to be compared for order.
	 * @param  {boolean} asc  Specifies ascending (true) or descending (false).
	 */
	function sort(array, key, asc) {
		array = array.sort(function(a, b) {
			if (asc) return (a[key] > b[key]) ? 1 : ((a[key] < b[key]) ? -1 : 0);
			else return (b[key] > a[key]) ? 1 : ((b[key] < a[key]) ? -1 : 0);
		});
	}

	// Test if caches have been queued
	if (this.queue.length > 0) {

		// Update CrossCompare status text in HTML page
		$(crosscompare.anchor + '-info').text('Comparison rendered.');

		// Retrieve chart information and settings
		var anchor = this.queue[0].anchor,
				type = this.charts[anchor].type,
				order = this.charts[anchor].order,
				yLabel = this.charts[anchor].yLabel,
				xLabel = this.charts[anchor].xLabel;

		// Retrieve first data item (exemplary) to test if it is number (or date)
		var n = this.queue[0].data[0].key,
				isDate = n instanceof Date,
				isNumber = !isNaN(parseFloat(n)) && isFinite(n);

		// Set up array for the combined cached data sets, and array to store the 
		// name of each combined data set for C3.js to identify as columns (i.e. 
		// each data set is being represented as its own line/bar)
		var totalCache = [], columns = [];

		// Over all cached data, find maximum and minimum values for correct scaling
		var globalMin, globalMax;
		$.each(crosscompare.queue, function(index, item) {
			// Retrieve data from the queue's item
			var data = item.data;

			// Find this cache's minimum and maximum if data is numeric (or date) via 
			// finding the first or last non-null value (as data is already ordered, 
			// but may be padded in null values)
			var min, max;
			if (isDate || isNumber) {
				// Find minimum
				for (i = 0; i < data.length; i++) {
					if (data[i][item.id] != null) {
						min = data[i].key;
						break;
					}
				};

				// Find maximum
				for (i = data.length -1; i >= 0; i--) {
					if (data[i][item.id] != null) {
						max = data[i].key;
						break;
					}
				};

				// Compare this cache's min and max with global min and max of all 
				// caches so far (can be skipped for first cache in queue)
				if (index != 0) {
					min = Math.min(min, globalMin);
					max = Math.max(max, globalMax);
				}

				// Update global minimum and maximum
				globalMin = min;
				globalMax = max;
			}

			// Combine all caches and add each cache's name as a column
			$.extend(true, totalCache, data);
			columns.push(item.id);
		});

		// If ordering has been set, retrieve key of values to be ordered by (always
		// sorts by first cache) and sort data
		var orderBy = this.queue[0].id;
		if (order != 'default') {
			if (order == 'asc')
				sort(totalCache, orderBy, true);
			else
				sort(totalCache, orderBy, false);
		}

		// JSON object containing C3.js graphing information
		var options = {
			bindto: crosscompare.anchor,
			size: { height: crosscompare.height },
			padding: crosscompare.padding,
			data: { json: totalCache, keys: { x: 'key', value: columns } },
			zoom: { enabled: true, rescale: true }, // Enable using mouse-wheel to zoom in
			color: { pattern: d3.scale.category10().range() } // D3.js colors
		};

		// If legends have been added, show legend
		if (crosscompare.legends.length == 0) 
			options.legend = { show: false };

		// If specific chart width has been set, use provided width
		if (crosscompare.width != 'auto')
			options.size.width = crosscompare.width;

		// If data is numeric (or date), add x-axis formatting information
		if (isDate || isNumber) {
			options.axis = { x: {
					tick: { fit: false },
					min: Number(globalMin),
					max: Number(globalMax)
			} };

			// Add time formatting information for x-axis if data is date
			if (isDate) {
				options.axis.x.type = 'timeseries';
				options.axis.x.tick.format = crosscompare.dateFormat;
			}
		} else
			// If data is non-numeric, add category x-axis information
			options.axis = { x: { type: 'category' } };

		// If comparison chart type is not line, add that type (as C3.js' default 
		// chart is line-chart)
		if (type != 'line')
			options.data.type = type;

		// If comparison chart type is bar, add bar-width information
		if (type == 'bar')
			options.bar = { width: { ratio: this.charts[anchor].ratio } };

		// Add information on whether to show or hide x- and y-axis grid-lines
		options.grid = {
			x: { show: crosscompare.xGrid },
			y: { show: crosscompare.yGrid }
		}

		// If y-axis label has been provided, show label
		if (yLabel != '')
			options.axis.y = { label: yLabel };					

		// If x-axis label has been provided, show label; Option has to be provided 
		// as value (instead of JSON (see yLabel above)), as all previous axis.x 
		// options would be overwritten
		if (xLabel != '')
			options.axis.x.label = xLabel;

		// Render comparison chart with compiled options and store pointer
		crosscompare.chart.rendered = c3.generate(options);

	} else 
		// Update CrossCompare status text in HTML page if no data has been cached
		$(crosscompare.anchor + '-info').text('Nothing cached.');
};

/** 
 * Export to enable CrossCompare usage with Node.js.
 * @exports crosscompare The CrossCompare instance.
 */
if (typeof exports !== 'undefined')
	module.exports = crosscompare;