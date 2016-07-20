/* EVENTS */

$('.js-my-xp').remove();

$('<div class="header-btn js-my-xp"><div class="header-btn-text">XP: <span class="current-xp">0</span> | Faltam: <span class="remaining-xp">0</span></div></div>').appendTo('.header-user');

$('#board').css({
	'background': 'url(https://raw.githubusercontent.com/rodrigoantinarelli/trello-xp/master/cover/img.jpg)',
	'background-size': '200px'
});

function countXP(){

	var myXP = 0;
	var currentUser = $('.header-member .member-avatar').attr('title');

	$('.js-list-name-input').each(function() {
		if($(this).html() == "Done"){

			$(this).parent().parent().find('.list-card .member-avatar[title="' + currentUser + '"]').each(function(){
				var cardValue = $(this).parent().parent().parent().find('.card-label').html();
				cardValue = parseInt(cardValue.replace('CARD ',''));
				if(!isNaN(cardValue)){
					myXP = myXP + cardValue;
				}
			});

		}
	});

	remainingXP = myXP >= 200 ? 'Bateu a meta! $$$$$$' : 200 - myXP;

	$('.current-xp').html(myXP);
	$('.remaining-xp').html(remainingXP);
}

var currentDomain = window.location.hostname;
if (currentDomain == "trello.com") {
	//CALL FUNCTION EVERY 1000ms
	setInterval(function(){
		countXP();
	}, 1000);
}
