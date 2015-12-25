module.exports = Player;

function Player(user, position, hero) {
    this.user = user;
    this.position = position;
    this.hero = hero;
    this.deck = [
        "1",
        this.hero === "arythea" ? "16" : "1",
        this.hero === "tovak" ? "13" : "2",
        "3", "3", "4", "4", "5", "5", "6",
        this.hero === "norowas" ? "15" : "7",
        "8", "9", "10",
        this.hero === "goldyx" ? "14" : "11",
        "12"
    ];
    this.hand = [];
    this.handLimit = 5;
    this.playedCards = [];
    this.discardPile = [];
    this.influence = 0;
    this.move = 0;
    this.meleeAttack = 0;
    this.rangedAttack = 0;
    this.siegeAttack = 0;
    this.block = 0;

    this.mana = {
        "white": 0,
        "red": 0,
        "green": 0,
        "blue": 0,
        "sun": 0,
        "night": 0
    };
    this.crystals = {
        "white": 0,
        "red": 0,
        "green": 0,
        "blue": 0
    };

    console.log("Player created!");
}

Player.Actions = {
    "Move": "move",
    "Attack": "meleeAttack",
    "Defence": "defence",
    "Influence": "influence"
};

Player.prototype.update = function(data) {
    this.deck = data.deck;
    this.hand = data.hand;
    this.handLimit = data.handLimit;
    this.user = data.user;
    this.position = data.position;
    this.hero = data.hero;
    this.playedCards = data.playedCards;
    this.discardPile = data.discardPile;
    this.influence = data.influence;
    this.move = data.move;
    this.meleeAttack = data.meleeAttack;
    this.rangedAttack = data.rangedAttack;
    this.siegeAttack = data.siegeAttack;
    this.block = data.block;
    this.mana = data.mana;
    this.crystals = data.crystals;
};

Player.prototype.drawHand = function() {
    var aNewCards = this.deck.splice(0, this.handLimit - this.hand.length);
    this.hand = Array.prototype.concat(this.hand, aNewCards);
};

Player.prototype.endTurn = function() {
    this.resetPoints();
    this.discardPlayedCards();
    this.drawHand();
};

Player.prototype.discardPlayedCards = function() {
    this.discardPile = Array.prototype.concat(this.discardPile, this.playedCards);
    this.playedCards = [];
};

Player.prototype.resetPoints = function() {
    this.influence = 0;
    this.move = 0;
    this.meleeAttack = 0;
    this.rangedAttack = 0;
    this.siegeAttack = 0;
    this.block = 0;
    this.mana = {
        "white": 0,
        "red": 0,
        "green": 0,
        "blue": 0,
        "sun": 0,
        "night": 0
    };
};

//pays the price of one crystal
Player.prototype.pay = function(manaColor, amount) {

};

//returns true if the card is found and the hand changed
Player.prototype.adjustHandAndPlayed = function(sCardId) {
    //remove the card from players hand
    var iCardIndexInHand = this.hand.indexOf(sCardId);
    if (iCardIndexInHand !== -1) {
        this.playedCards.push(sCardId);
        this.hand.splice(iCardIndexInHand, 1);

        console.log("Cards left: " + JSON.stringify(this.hand));

        return true;
    }

    return false;
};

/*************************************
 *             Cards                 *
 *************************************/

//Rage
Player.prototype.playCard1 = function(bAlternativeEffect, iOption, playSidewaysAs) {
    console.log("Player " + this.user + " plays card Rage!");
    if (!this.adjustHandAndPlayed("1")) {
        return;
    }

    if (playSidewaysAs) {
        this[playSidewaysAs] += 1;
    } else {
        if (bAlternativeEffect) {
            this.pay("red", 1);
            this.meleeAttack += 4;
        } else {
            this.meleeAttack += 2;
            //OR
            //this.block += 2;
        }
    }
};

//Swiftness
Player.prototype.playCard3 = function(bAlternativeEffect, iOption, playSidewaysAs) {
    console.log("Player " + this.user + " plays card Swiftness!");
    if (!this.adjustHandAndPlayed("3")) {
        return;
    }

    if (playSidewaysAs) {
        this[playSidewaysAs] += 1;
    } else {
        if (bAlternativeEffect) {
            this.pay("white", 1);
            this.rangedAttack += 3;
        } else {
            this.move += 2;
        }
    }
};

//March
Player.prototype.playCard4 = function(bAlternativeEffect, iOption, playSidewaysAs) {
    console.log("Player " + this.user + " plays card March!");
    if (!this.adjustHandAndPlayed("4")) {
        return;
    }

    if (playSidewaysAs) {
        this[playSidewaysAs] += 1;
    } else {
        if (bAlternativeEffect) {
            this.pay("green", 1);
            this.move += 4;
        } else {
            this.move += 2;
        }
    }
};

