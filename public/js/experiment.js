// Global variables
var code = '', // Questionnaire code
		tasks = [], // Array of tasks to be done
		current = -1, // Track current progress (-1 - 0: Training, >1: Tasks)
		clicks = 0, // Tracker for number of mouse clicks
		options = { // Overlay options
			opacity: 0.9, // Darken background
			blur: false, // Disable closing overlay via clicking outside the overlay-info
			escape: false, // Disable closing overlay via ESC
			onopen: function() { // Disable Next button for 5 seconds (force participant to read question)
				$('.exp').prop('disabled', true);
				setTimeout(function(){ $('.exp').prop('disabled', false); }, 5000);
			}
		};

/**
 * Highlights the defined elements (as they will be required for the upcoming task).
 * @param  {Object} element  The HTML element to be highlighted.
 * @param  {boolean} header  Whether the HTML element has a text header.
 * @param  {Object} button   Caching button to highlight (optional).
 */
function highlight(element, header, button) {
	$(element).closest('.box').addClass('highlight');
	if (header)
		$(element).closest('.box').find('.box-header').addClass('highlight-top');
	else
		$(element).closest('.box').find('.box-body').addClass('highlight-top');
	if (button)
		$(button).addClass('highlight-btn');
};

/** Trigger continue with the next part of the questionnaire */
function next() {
	// Remove all previous highlights
	$('.box').removeClass('highlight');
	$('.box-header').removeClass('highlight-top');
	$('.box-body').removeClass('highlight-top');
	$('.btn').removeClass('highlight-btn');

	if (current >= tasks.length) // End questionnaire
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

/**
 * Sends log request to server.
 * @param  {boolean} start Whether the log request marks the start or end of a task.
 */
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

		// Advance counter and trigger next page
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

	// Hide navigation (not required in experiment set up)
	$('.navbar-header').hide();
	$('.navbar-nav').hide();

	// Automatically show intro overlay
	$('#exp-intro').popup('show');
	$('.exp-intro_close').click(function() {
		// Save entered questionnaire code
		code = $('#exp-code').val();
		tasks = code.split('-');

		// Trigger next page (with delay; overlay bug if direct)
		setTimeout(function(){ next(); }, 10);
	});
});