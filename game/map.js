var initialMap = require('../models/map1.json');

module.exports = Map;

function Map(gameNumber, requiredPlayers) {
    this.game_number = gameNumber;
    this.requiredPlayers = requiredPlayers;
    this.players = [];
    console.log(initialMap);
    this.squares = JSON.parse(JSON.stringify(initialMap));
}