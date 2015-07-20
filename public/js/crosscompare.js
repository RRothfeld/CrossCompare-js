var crosscompare = {
	active: {},
	charts: {},
	chartHeight: 200, // default
	chartAnchor: '#crosscompare', // default
	height: function(number) {
		this.chartHeight = number;

		return this; // chainable
	},
	anchor: function(selector) {
		this.chartAnchor = selector;

		return this; // chainable
	},
	resetOn: function(selector) {
		$(selector).on('click', function() {
			crosscompare.active['crossChart'].destroy();
			crosscompare.active = {};
		});

		return this; // make chainable
	},
	add: function(selector, chart, type) {
		// add chart to charts with given name
		this.charts[selector] = chart;

		$(selector).on('click', function() {
			// flashing animation (10 ms -> 700 ms)
			$(chart.anchor()).fadeTo(10, 0.3).fadeTo(700, 1.0);

			// render crosscompare chart
			crosscompare.render(crosscompare.charts[selector], type);
		});

		return this; // make chainable
	},
	render: function(chart, chartType) {

		var cache = $.extend(true, [], chart.group().all());

		// IF STACKED
		//console.log(chart.stack());

		//var name = chart.filters();
		var name = +Math.random();

		var filters = chart.filters()[0];
		console.log(chart.filters());
		$.each(cache, function(i, val) {
			// if there is a filter, check if single filter, if data does not equal filter: delete; if filter range, check if data is within range otherwise: delete;
			if (typeof filters !== 'undefined' &&
				((filters.length == 1 
					&& val.key != filters[0]) 
				|| (filters.length == 2 
					&& (val.key < filters[0] || val.key > filters[1])
				))) {
				delete cache[i];
			} else {
				val[name] = val.value;
				delete val.value;
			}
		});

		if (!this.active['chart'] || this.active['chart'] != chart) {
			// fill active as to signal that a crosscompare has been created
			this.active['chart'] = chart;

			var crossChart;

			if (chartType == 'line') {
				crossChart = c3.generate({
					bindto: this.chartAnchor,
					size: { height: this.chartHeight },
					padding: { top: 0, right: 0, bottom: 0, left: 0 },
					data: {
						json: cache,
						keys: { x: 'key', value: [name] },
						types: { value: [name] }
					},
					zoom: {
						enabled: true
					},
					axis: {
						x: { type: 'timeseries', tick: { format: '%d.', fit: false } }
					}
				});
			} else {
				crossChart = c3.generate({
					bindto: this.chartAnchor,
					bar: { width: { ratio: 0.5 } }, // or width: 100 
					size: { height: this.chartHeight },
					padding: { top: 0, right: 0, bottom: 0, left: 0 },
					data: {
						json: cache,
						keys: { x: 'key', value: [name] },
						types: { value: [name] },
						type: chartType
					},
					zoom: {
						enabled: true
					},
					axis: {
						x: { type: 'category'	}
					}
				});
			}

			// make available later (see below)
			this.active['crossChart'] = crossChart;

		} else {
			if (chartType == 'line') {
				this.active['crossChart'].load({
					json: cache,
					keys: { x: 'key', value: [name] },
				});
			} else {
				this.active['crossChart'].load({
					json: cache,
					keys: { x: 'key', value: [name] },
					type: chartType
				});
			}
		}
	}
};