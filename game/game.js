var initialMap = require('../models/map1.json');
var Player = require('./player.js');
var shuffle = require('./shuffle.js');

module.exports = Game;

function Game(gameNumber, requiredPlayers) {
    this.heroes = ["goldyx", "norowas", "towak", "arythea"];

    this.tilesLeft = [];
    this.initTilesLeft(requiredPlayers);

    this.timestamp = new Date();
    this.game_number = gameNumber;
    this.requiredPlayers = requiredPlayers;
    this.players = [];
    this.activePlayer = 0;
    this.map = JSON.parse(JSON.stringify(initialMap));
    this.started = false;
}

Game.prototype.update = function(data) {
    this.heroes = data.heroes;
    this.players = [];
    for (var i = 0; i < data.players.length; i++ ) {
        this.players.push(new Player(data.players[i].user, data.players[i].position, data.heroes[i]));
        this.players[i].update(data.players[i]);
    }

    this.tilesLeft = data.tilesLeft;
    this.activePlayer = data.activePlayer;
    this.map = data.map;
    this.started = data.started;
    this.timestamp = new Date();
};

Game.prototype.updateTimestapm = function() {
    this.timestamp = new Date();
};

Game.prototype.initTilesLeft = function(iPlayersCount) {
    var countryTilesCount = 8,
        nonCityTilesCount = 2,
        cityTilesCount = 1,
        coreNonCityTiles = [15, 16, 17, 18],
        coreCityTiles = [19, 20, 21, 22],
        randomIndex,
        i;
    //arrange tiles
    if (this.requiredPlayers === 3) {
        countryTilesCount = 9;
    } else if (this.requiredPlayers === 4) {
        countryTilesCount = 11;
    }

    for (i = 3; i <= countryTilesCount; i++) {
        this.tilesLeft.push(i);
    }

    var coreTiles = [];

    for (i = 0; i < nonCityTilesCount; i++) {
        randomIndex = Math.floor(Math.random() * coreNonCityTiles.length);
        var tileID = coreNonCityTiles.splice(randomIndex, 1)[0];
        coreTiles.push(tileID);
    }

    for (i = 0; i < cityTilesCount; i++) {
        randomIndex = Math.floor(Math.random() * coreCityTiles.length);
        var tileID = coreCityTiles.splice(randomIndex, 1)[0];
        coreTiles.push(tileID);
    }

    shuffle(coreTiles);
    this.tilesLeft = Array.prototype.concat(this.tilesLeft, coreTiles);
};

Game.prototype.endTurn = function() {
    this.players[this.activePlayer].endTurn();
    this.activePlayer = this.activePlayer < this.players.length - 1 ? this.activePlayer + 1 : 0;
};

Game.prototype.join = function(userName) {
    if (this.players.length < this.requiredPlayers) {
        this.players.push(new Player(userName, this.players.length, this.heroes[this.players.length]));
        shuffle(this.players[this.players.length - 1].deck);
        this.players[this.players.length - 1].drawHand();
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

Game.prototype.playerReveal = function(centerX, centerY) {
    for (var i = 0; i < this.map.centers.length; i++) {
        if (centerX === this.map.centers[i].x && centerY === this.map.centers[i].y) {
            var tileId = this.tilesLeft.splice(0, 1)[0];
            this.map.centers[i].tile = tileId; //get a new tile
            break;
        }
    }
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
    "game_number", "requiredPlayers", "players", "user", "hand", "playedCards", "move"
];
