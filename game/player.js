module.exports = Player;

function Player(user, position) {
    this.user = user;
    this.position = position;
    this.deck = [];
    this.hand = ["2", "3", "1", "4", "4", "4", "4", "4", "4", "4", "4"];
    this.influence = 0;
    this.move = 0;
    this.meleeAttack = 0;
    this.rangedAttack = 0;
    this.siegeAttack = 0;

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
    console.log(JSON.stringify(this, '\t'));
}

Player.Actions = {
    "Move": "move",
    "Attack": "meleeAttack",
    "Defence": "defence",
    "Influence": "influence"
};

Player.prototype.update = function(data) {
    this.move = data.move;
    this.meleeAttack = data.meleeAttack;
    this.rangedAttack = data.rangedAttack;
    this.siegeAttack = data.siegeAttack;
};

Player.prototype.pay = function(manaColor, amount) {

};

/*************************************
 *             Cards                 *
 *************************************/

//Swiftness
Player.prototype.playCard4 = function(bAlternativeEffect, iOption, playSidewaysAs) {
    //remove the card from players hand
    var iCardIndexInHand = this.hand.indexOf("4");
    if (iCardIndexInHand !== -1) {
        this.hand.splice(iCardIndexInHand, 1);

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
    }

    console.log("Player " + this.user + " played card Swiftness!");
    console.log("Cards left: " + JSON.stringify(this.hand));
};

