var Game = require('./game.js');

module.exports = GameServer;

function GameServer() {
    this.games = [
        //{
        //    game_number:123451234,
        //    requiredPlayers: 4,
        //    players: [username, username2]
        //}
    ];
}

GameServer.Default_Required_Players = 4;

GameServer.prototype.getGames = function() {
    return this.games;
};

GameServer.prototype.newGame = function(userName) {
    var newGame = new Game(this.games.length, GameServer.Default_Required_Players);
    newGame.join(userName);
    this.games.push(newGame);
};

GameServer.prototype.findGame = function(gameNumber) {
    console.log('finding game: ' + gameNumber);
    console.log("typeof gameNumber: " + typeof gameNumber);

    return this.games.find(function(game){
        return game.getNumber() === gameNumber;
    });
};

GameServer.prototype.White_List_Properties_All_Games = [
    "games",
        "game_number", "requiredPlayers", "players"
];