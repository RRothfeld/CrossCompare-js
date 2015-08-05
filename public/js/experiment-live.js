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
		$(document).find('iframe').on('load', function () {
			log('survey-next');

			dc.filterAll();
			dc.redrawAll();

			if (page == 0)
				$('#overlay').fadeOut('fast');

			if (page > 0) {
				$('.openCross').show();
				crossActive = true;
			}

			if (page >= 2) {
				$('#overlay').fadeIn('fast');
			}

			page++;
		});
	} else
		setTimeout(function(){ loop(); }, 2000);
};

setTimeout(function(){ loop(); }, 2000);

$('button').on('click', function() { log(this.outerHTML); });

$('#resetAll').click(function() { log('resetAll-button'); });