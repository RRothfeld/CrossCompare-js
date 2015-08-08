// Global variables
var code = '',
		tasks = [],
		current = -1, // -1 = Training, 0 = Comp. Training, 1+ = Tasks
		clicks = 0,
		options = { 
			opacity: 0.9,
			blur: false,
			escape: false,
			onopen: function() {
				$('.exp').prop('disabled', true);
				setTimeout(function(){ $('.exp').prop('disabled', false); }, 5000);
			}
		};

function highlight(element, header, button) {
	$(element).closest('.box').addClass('highlight');
	if (header)
		$(element).closest('.box').find('.box-header').addClass('highlight-top');
	else
		$(element).closest('.box').find('.box-body').addClass('highlight-top');
	if (button)
		$(button).addClass('highlight-btn');
};

// Ordering logic
function next() {
	// Sample code: EX1-A0-B0-C1-D1
	
	// Remove all previous highlights
	$('.box').removeClass('highlight');
	$('.box-header').removeClass('highlight-top');
	$('.box-body').removeClass('highlight-top');
	$('.btn').removeClass('highlight-btn');

	if (current >= tasks.length) // End
		$('#exp-end').popup('show');
	else {
		// Which overlay
		if (current == -1) { // Show training
			$('#exp-training-baseline').popup('show');
			highlight('#flights', false);
			highlight('#delayChart', true);
		} else if (current == 0) { // Show comparison training
			$('#exp-training-compare').popup('show');
			highlight('#airlineSelect', false);
			highlight('#movementsChart', true, '#movementsChart-cross');
		} else { // Show task
			$('#exp-task').popup('show');
			switch(tasks[current]) {
				case 'A0':
					highlight('#airlineSelect', false);
					highlight('#movementsChart', true);
					break;
				case 'A1':
					highlight('#airlineSelect', false);
					highlight('#movementsChart', true, '#movementsChart-cross');
					break;
				case 'B0':
					highlight('#airportSelect', false);
					highlight('#airportsChart', true);
					highlight('#delayChart', true);
					highlight('#todChart', true);
					break;
				case 'B1':
					highlight('#airportSelect', false);
					highlight('#airportsChart', true, '#airportsChart-cross');
					highlight('#delayChart', true);
					highlight('#todChart', true);
					break;
				case 'C0':
					highlight('#weekdayChart', true);
					break;
				case 'C1':
					highlight('#weekdayChart', true, '#weekdayChart-cross');
					break;
				case 'D0':
					highlight('#airportSelect', false);
					highlight('#airlineSelect', false);
					highlight('#delayChart', true);
					highlight('#todChart', true);
					break;
				case 'D1':
					highlight('#airportSelect', false);
					highlight('#airlineSelect', false);
					highlight('#delayChart', true);
					highlight('#todChart', true, '#todChart-cross');
					break;
			}
		}

		// With or without crosscompare
		if (current >= 0) {
			if (tasks[current].substring(1) == '0')
				$('.openCross').hide();
			else
				$('.openCross').show();
		}
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
		setTimeout(function(){ next(); }, 10);
	});
});