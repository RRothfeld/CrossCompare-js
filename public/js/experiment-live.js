var crossActive = false,
		element = '';
$('.openCross').hide();

var page = 0;

function log(item) {
	element = item;
	$.post('/log', { 'crosscompare': crossActive, 'element': element });
};

// var width = $('#survey').width() - 5,
// 		height = $(document).height();

// $('#survey').append('<iframe src=\"https://docs.google.com/forms/d/1oBOroyBYlEqDDQiv61uX29n7gpikNvsPTuvEteku13g/viewform?embedded=true\" width=\"'+width+'\" height=\"'+height+'\" frameborder=\"0\" marginheight=\"0\" marginwidth=\"0\">Loading...</iframe>');

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