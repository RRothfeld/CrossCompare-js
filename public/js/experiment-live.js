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

		// $(document).find('iframe').attr('scrolling','no');

		setTimeout(function(){ 
			$(document).find('iframe').on('load', function () {
				log('survey-next');

				// dc.filterAll();
				// dc.redrawAll();

				// if (page == 0)
				// 	$('#overlay').fadeOut('fast');
				// else if (page == 1) {
				// 	$('.openCross').show();
				// 	crossActive = true;
				// } else if (page == 2) {
				// 	$('#overlay').fadeIn('fast');
				// 	setTimeout(function(){ window.location = '/experiment'; }, 3000);
				// }

				page++;
			});
		}, 2000);
	} else
		setTimeout(function(){ loop(); }, 2000);
};

setTimeout(function(){ loop(); }, 2000);

$('button').on('click', function() { log(this.outerHTML); });

$('#resetAll').click(function() { log('resetAll-button'); });