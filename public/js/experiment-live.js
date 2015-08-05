var crossActive = false,
		element = '';
$('.openCross').hide();

var page = 0;

function log(item) {
	element = item;
	$.post('/log', { 'crosscompare': crossActive, 'element': element });
};

function loop() {
	if ($(document).find('iframe').length > 0) {
		setTimeout(function(){ 
			$(document).find('iframe').on('load', function () {
				log('survey-next');

				dc.filterAll();
				dc.redrawAll();

				if (page == 0)
					$('#overlay').fadeOut('fast');
				else if (page == 1) {
					$('.openCross').show();
					crossActive = true;
				} else if (page == 2) {
					$('#overlay').fadeIn('fast');
					setTimeout(function(){ window.location = '/experiment'; }, 3000);
				}

				page++;
			});
		}, 3000);
	} else
		setTimeout(function(){ loop(); }, 1000);
};

setTimeout(function(){ loop(); }, 1000);

$('button').on('click', function() { log(this.outerHTML); });

$('#resetAll').click(function() { log('resetAll-button'); });