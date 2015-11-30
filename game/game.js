var initialMap = require('../models/map.json');

module.exports = Game;

function Game(gameNumber, requiredPlayers) {
    this.game_number = gameNumber;
    this.requiredPlayers = requiredPlayers;
    this.players = [];
    console.log(initialMap);
    this.map = JSON.parse(JSON.stringify(initialMap));

    //{
    //    game_number: this.games.length,
    //        requiredPlayers: GameServer.Default_Required_Players,
    //    players: [userName]
    //}
}

Game.prototype.join = function(userName) {
    if (this.players.length < this.requiredPlayers) {
        this.players.push(userName);
        this.map.players.push({ square: { x: 1, y: 0}});
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

Game.prototype.getPlayerPosition = function(username) {
    console.log('searching player: ' + username);
  return this.players.indexOf(username);
};

Game.prototype.playerMove = function(player, x, y) {
    this.map.players[player].square = { x: x, y: y};
};

Game.prototype.White_List_Properties_No_Map = [
    "game_number", "requiredPlayers", "players"
];