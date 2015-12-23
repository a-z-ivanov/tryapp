module.exports = Player;

function Player(user, position) {
    this.user = user;
    this.position = position;
    this.deck = [];
    this.hand = ["3", "1", "4", "4", "4", "4", "4", "4", "4", "4", "6", "7"];
    this.playedCards = [];
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
    this.playedCards = data.playedCards;
    this.influence = data.influence;
    this.move = data.move;
    this.meleeAttack = data.meleeAttack;
    this.rangedAttack = data.rangedAttack;
    this.siegeAttack = data.siegeAttack;
    this.block = 0;
    this.mana = data.mana;
    this.crystals = data.crystals;
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

