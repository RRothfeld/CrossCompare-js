// Global variables for logging
var crossActive = false,
		element = '';

// Begin survey with CrossCompare hidden
$('.openCross').hide();

// Survey page tracker
var page = 1;

// Writes to server-side txt-file via API call
function log(item) {
	element = item;
	$.post('/log', { 'crosscompare': crossActive, 'element': element });
};

// Survey page control, recursive until Surveymonkey iframe is loaded
function loop() {
	if ($(document).find('iframe').length > 0) {

		setTimeout(function(){ 
			$(document).find('iframe').on('load', function () {
				// Log next button to next survey page
				log('survey-next');

				// Increase survey page tracker and act accordingly
				page++;
				if (page == 3)
					$('#overlay').fadeOut('fast');
				else if (page == 9) {
					$('#overlay').fadeIn('fast');
					$('.openCross').show();
					crossActive = true;
				} else if (page == 10)
					$('#overlay').fadeOut('fast');
				else if (page == 16)
					$('#overlay').fadeIn('fast');
				else if (page == 20) {
					$('#overlay').fadeIn('fast');
					setTimeout(function(){ window.location = '/experiment'; }, 5000);
				}

				// Reset all filters
				dc.filterAll();
				dc.redrawAll();
				
				// Reset CrossCompare
				crosscompare.clear();
				$('#maxCrossCompare').popup('hide');

			});
		}, 2000);
	} else
		setTimeout(function(){ loop(); }, 2000);
};

setTimeout(function(){ loop(); }, 2000);

// Log all button clicks and reset-all-link
$('button').on('click', function() { log(this.outerHTML); });
$('#resetAll').click(function() { log('resetAll-button'); });