module.exports = Game;

function Game(gameNumber, requiredPlayers) {
    this.game_number = gameNumber;
    this.requiredPlayers = requiredPlayers;
    this.players = [];
    //{
    //    game_number: this.games.length,
    //        requiredPlayers: GameServer.Default_Required_Players,
    //    players: [userName]
    //}
}

Game.prototype.join = function(userName) {
    if (this.players.length < this.requiredPlayers) {
        this.players.push(userName);
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

Game.prototype.White_List_Properties_No_Map = [
    "game_number", "requiredPlayers", "players"
];
