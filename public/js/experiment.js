// Global variables
var code = '',
		tasks = [],
		current = 0,
		clicks = 0,
		options = { 
			opacity: 0.9,
			blur: false,
			escape: false,
			onopen: function() {
				$('.exp').prop('disabled', true);
				setTimeout(function(){ $('.exp').prop('disabled', false); }, 10000);
			}
		};

// Ordering logic
function next() {
	console.log(tasks[current]);
	// Sample code: EX1-A0-D0-T1-B1-C1
	
	if (current >= tasks.length) // End
		$('#exp-end').popup('show');
	else {
		// Which overlay
		if (tasks[current].substring(0,1) == 'T') // Show comparison training
			$('#exp-training-compare').popup('show');
		else // Show task
			$('#exp-task').popup('show');

		// WIth or without crosscompare
		if (tasks[current].substring(1) == '0')
			$('.openCross').hide();
		else
			$('.openCross').show();
	}
};

// Send log request to server
function log(start) {
	var message = { 'code': code, 'task': tasks[current], 'clicks': clicks }

	if (start)
		message.status = 'start';
	else
		message.status = 'stopp';

	// Log and reset click count
	$.post('/log', message);
	clicks = 0;
};

$(document).ready(function() {
	// Hide crosscompare buttons
	$('.openCross').hide();

	// Log start of experiment
	$.post('/log', { 'status': 'START OF SURVEY' });

	// Record all clicks
	$(document).click(function() { clicks++; });

	// Log start of task
	$('.exp-start').click(function() { log(true); });

	//Log end of task
	$('#exp-cont').click(function() { 
		log(false);

		current++;
		next();

		// Reset all filters
		$('#airportSelect').val('ALL');
		airport.filterAll();
		$('#airlineSelect').val('ALL');
		airline.filterAll();
		dc.filterAll();
		dc.redrawAll();
	});

	// Initialize survey overlays
	$('#exp-intro').popup(options);
	$('#exp-training-baseline').popup(options);
	$('#exp-training-compare').popup(options);
	$('#exp-task').popup(options);
	$('#exp-end').popup(options);

	// Overall
	$('.navbar-header').hide();
	$('.navbar-nav').hide();

	// Intro
	$('#exp-intro').popup('show');
	$('.exp-intro_close').click(function() {
		code = $('#exp-code').val();
		tasks = code.split('-');
		setTimeout(function(){ $('#exp-training-baseline').popup('show'); }, 10);
	});
});