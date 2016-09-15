function CountXP() {
    var self = this;

    this.currentUser = $('.header-member .member-avatar').attr('title');
    this.me;
    this.boards;
    this.cards;
    this.totalPoints;
    this.lists;

    this.init = function() {
        self.getBoards();
    }

    this.getBoards = function() {
        $.ajax(window.location.origin + "/1/Members/me?boards=open&board_fields=shortLink")
        	.success(function (data) {
        		self.me = data.id;
                self.boards = data.boards.map(function(elem, index) {
                    return elem.shortLink;
                })
        	})
            .done(self.getLists);
    }

    this.getLists = function() {
        var requests = new Array();

        self.boards.forEach(function(boardName) {
            requests.push(
                $.ajax(window.location.origin + "/1/Boards/" + boardName + "?lists=open&cards=visible&card_fields=idList%2CidMembers%2Clabels&card_checklists=none")
                .success(function(data) {
                    self.lists = data.lists;
                    self.lists = self.lists
                        .filter(function(value) {
                            var name = value.name.toLowerCase();

                            if (name == "validation" || name == "deploy" || name == "done") {
                                return value
                            }
                        })
                        .map(function(value) {
                            return value.id
                        });

                    self.cards = data.cards;
                    self.cards = self.cards.filter(function(value) {
                        if (self.lists.length != 0 && self.lists.length != null && self.lists.indexOf(value.idList) != -1 && value.idMembers.indexOf(self.me) != -1) {
                            return value;
                        }
                    });
                })
            )
        });

        $.when.apply($, requests).then(self.getPoints);
    }


    this.getPoints = function() {
        self.totalPoints = 0;

        self.cards.forEach(function(card) {
            var cardPoints = 0;

            card.labels.forEach(function(entry) {
                if (entry.name.indexOf('CARD') != -1) {
                    cardPoints += parseInt(entry.name.slice(5));
                }
            })

            cardPoints = cardPoints / card.idMembers.length;
            self.totalPoints += cardPoints;
        });

        self.printResults();
    }


    this.printResults = function(argument) {
        var remainingXP = self.totalPoints >= 200 ? 'Bateu a meta! $$$$$$' : 200 - self.totalPoints;

        if(remainingXP != $('.remaining-xp').text()){
        	$('.current-xp').html(self.totalPoints);
	        $('.remaining-xp').html(remainingXP);
	    }
    }
};


$(window).load(function() {
	var countXP = new CountXP();

	var currentDomain = window.location.hostname;
	if (currentDomain == "trello.com") {
		$('<div class="header-btn js-my-xp"><div class="header-btn-text">XP: <span class="current-xp">0</span> | Faltam: <span class="remaining-xp">0</span></div></div>').appendTo('.header-user');

		countXP.init();

	    $('#board').css({
	        'background': 'url(https://raw.githubusercontent.com/rodrigoantinarelli/trello-xp/master/cover/img.jpg)',
	        'background-size': '200px'
	    });

	    var lastChangeLists,
	        listChanged = new MutationObserver(function() {
	            clearTimeout(lastChangeLists);

	            lastChangeLists = setTimeout(countXP.getLists, 200)
	        }),
	        mutationConfig = {
	            childList: true,
	            subtree: true
	        };

	    $('#board .list').each(function(index, el) {
	        listChanged.observe(el, mutationConfig);
	    });       
	}
});
