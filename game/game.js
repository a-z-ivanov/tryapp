var initialMap = require('../models/map1.json');
var Player = require('./player.js');

module.exports = Game;

function Game(gameNumber, requiredPlayers) {
    this.game_number = gameNumber;
    this.requiredPlayers = requiredPlayers;
    this.players = [];
    this.map = JSON.parse(JSON.stringify(initialMap));
    this.started = false;
}

Game.prototype.update = function(data) {
    this.players = [];
    for (var i = 0; i < data.players.length; i++ ) {
        this.players.push(new Player(data.players[i].user, data.players[i].position));
        this.players[i].update(data.players[i]);
    }

    this.map = data.map;
    this.started = data.started;
};

Game.prototype.join = function(userName) {
    if (this.players.length < this.requiredPlayers) {
        this.players.push(new Player(userName, this.players.length));
        this.map.players.push({ square: { x: 6, y: 28}});
        return true;
    }

    return false;
};

Game.prototype.getNumber = function() {
    return this.game_number;
};

Game.prototype.isFull = function() {
    return this.players.length === this.requiredPlayers;
};

Game.prototype.getPlayerPositionAndSquare = function(username) {
    var iPlayerIndex = this.getPlayerPositionByUsername(username);
    return { position: iPlayerIndex, square: this.map.players[iPlayerIndex].square };
};

Game.prototype.playerMove = function(iPlayerPos, x, y) {
    this.map.players[iPlayerPos].square = { x: x, y: y};
};

Game.prototype.getPlayerPositionByUsername = function(username) {
    for (var i = 0; i < this.players.length; i++) {
        if (this.players[i].user === username) {
            return i;
        }
    }
};

Game.prototype.getPlayerByPosition = function(iPlayerPosition) {
    return this.players[iPlayerPosition];
};

Game.prototype.playCards = function(iPlayerPosition, aCards) {
    var player = this.getPlayerByPosition(iPlayerPosition);

    for (var i = 0; i < aCards.length; i++) {
        if (player["playCard" + aCards[i]]) {
            player["playCard" + aCards[i]]();
        }
    }

    return player;
};

Game.prototype.White_List_Properties_No_Map = [
    "game_number", "requiredPlayers", "players", "user", "hand", "move"
];
