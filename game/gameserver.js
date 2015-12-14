var Game = require('./game.js');
var GameModel = require('../models/gamemodel.js');

module.exports = GameServer;

function GameServer() {
    this.games = [
        //{
        //    game_number:123451234,
        //    requiredPlayers: 4,
        //    players: [username, username2]
        //}
    ];

    //remove inactive games every 15 minutes
    setInterval(function() {
        console.log("Cleaning inactive games...");

        var d = new Date();

        for (var i = this.games.length - 1; i >= 0 ; i--) {
            if (this.games[i].timestamp.getTime() + 1 * 60 * 1000 < d.getTime()) {
                console.log("Game " + this.games[i].game_number + " is saved and unloaded.");
                this.saveGame(this.games[i].game_number);
                this.games.splice(i, 1);
            } else {
                console.log("Game " + this.games[i].game_number + " is staying.");
            }
        }
    }.bind(this), 1 * 60 * 1000);
}

GameServer.Default_Required_Players = 2;

GameServer.prototype.getLobbyGames = function() {
    return this.games.filter(function(game) {
        return game.started === false;
    });
};

GameServer.prototype.newGame = function(userName, callback) {
    //get the next game number
    GameModel.find({}).sort('-gamenumber').exec(function(err, games) {
        var iNextGameNumber = games.length ? games[0].gamenumber + 1 : 0;
        var newGame = new Game(iNextGameNumber, GameServer.Default_Required_Players);
        newGame.join(userName);
        this.games.push(newGame);

        this.saveGame(iNextGameNumber);

        callback(this.getLobbyGames());
    }.bind(this));
};

GameServer.prototype.findGame = function(gameNumber) {
    //console.log('finding game: ' + gameNumber);
    //console.log("typeof gameNumber: " + typeof gameNumber);

    return this.games.find(function(game) {
        return game.getNumber() === gameNumber;
    });
};

GameServer.prototype.loadGame = function(gameNumber, callback) {
    GameModel.findOne({ 'gamenumber' :  gameNumber }, function(err, gameModel) {
        // In case of any error, return using the done method
        if (err){
            console.log('Could not find game: ' + err);
            return done(err);
        }

        // game does not exists in the db
        if (gameModel) {
            var game = this.findGame(gameNumber);

            if (!game) {
                this.games.push(new Game(gameNumber, gameModel.game.requiredPlayers));
                game = this.games[this.games.length - 1];
            }
            game.update(gameModel.game);
            callback(game);
        }
    }.bind(this));
};

GameServer.prototype.saveGame = function(gameNumber) {
    var game = this.findGame(gameNumber);

    GameModel.findOne({ 'gamenumber' :  gameNumber }, function(err, gameModel) {
        // In case of any error, return using the done method
        if (err){
            console.log('Could not find game: ' + err);
            return done(err);
        }

        // game does not exists in the db
        if (!gameModel) {
            gameModel = new GameModel();
            gameModel.gamenumber = gameNumber;
            gameModel.started = game.started;
        }

        gameModel.game = game;
        gameModel.timestamp = new Date();

        // save the user
        gameModel.save(function(err) {
            if (err){
                console.log('Could not save game: '+err);
                throw err;
            }
            console.log('Game ' + game.game_number + ' saved succesfully.');
        });
    });
};

GameServer.prototype.White_List_Properties_All_Games = [
    "games",
        "game_number", "requiredPlayers", "players", "user"
];