$('#reset-compare').on('click', function() {
	$('#comparison-dropbox').show();
	$('#comparison-chart').hide();
});

// Graph test

$('#test').on('click', function() {

	var cache = jQuery.extend(true, [], byDate.top(Infinity));

	var name = $('#airport-select').val() + weekdayChart.filters();

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

	// different group!
	var cache = jQuery.extend(true, [], byDelay.top(Infinity));

	var name = $('#airport-select').val() + weekdayChart.filters();

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