module.exports = function(io, gameServer) {
    var gamelist = io.of('/gamelist')
        .on('connection', function(socket) {
            console.log('Socket.io connection to gamelist established!');
            var games = gameServer.getGames();

            socket.emit('gameroomupdate', JSON.stringify(games, gameServer.White_List_Properties_All_Games));

            socket.on('newgame', function(data) {
                console.log(data.username + " creates a new game!");

                gameServer.newGame(data.username);

                socket.broadcast.emit('gameroomupdate', JSON.stringify(games, gameServer.White_List_Properties_All_Games));
                socket.emit('gameroomupdate', JSON.stringify(games, gameServer.White_List_Properties_All_Games));
            });

            socket.on('joingame', function(data) {
                console.log(data.username + " joins game " + data.game_number + "!");
                var currentGame = gameServer.findGame(data.game_number);

                if (currentGame.join(data.username)) {
                    socket.broadcast.emit('gameroomupdate', JSON.stringify(games, gameServer.White_List_Properties_All_Games));
                    socket.emit('gameroomupdate', JSON.stringify(games, gameServer.White_List_Properties_All_Games));

                    if (currentGame.isFull()) {
                        //start game
                        socket.broadcast.emit('startgame', JSON.stringify(currentGame, currentGame.White_List_Properties_No_Map));
                        socket.emit('startgame', JSON.stringify(currentGame, currentGame.White_List_Properties_No_Map));
                    }
                } else {
                    //message game is full
                }
            });

            //var map = require('../models/map.json');
            //socket.emit('mapupdate', JSON.stringify(map));
        });

    var game = io.of('/game')
        .on('connection', function(socket) {
            console.log('Socket.io connection to game established!');

            socket.on('creategamechannel', function(data) {
                console.log("creating game channel: " + data.game_number);
                socket.username = data.username;
                socket.player = data.player;
                socket.join(data.game_number);

                var game = gameServer.findGame(parseInt(data.game_number, 10));

                socket.emit('mapupdate', JSON.stringify(game.map));
                socket.emit('playerupdate', JSON.stringify(game.getPlayerByPosition(parseInt(data.player, 10))));
            });

            //socket.emit('move', { game_number: game_number, player: playerPos, x: toX, y: toY, spentPoints: 2 });
            socket.on('move', function(data) {
                var game = gameServer.findGame(parseInt(data.game_number, 10)),
                    iPlayerPos = parseInt(data.player,10),
                    oPlayer = game.getPlayerByPosition(iPlayerPos);

                console.log("player get: ", JSON.stringify(oPlayer));

                game.playerMove(iPlayerPos, parseInt(data.x, 10), parseInt(data.y, 10));
                oPlayer.move -= parseInt(data.spentPoints, 10);

                socket.broadcast.to(data.game_number).emit('mapupdate', JSON.stringify(game.map));
                socket.emit('mapupdate', JSON.stringify(game.map));
                socket.emit('playerupdate', JSON.stringify(oPlayer));
            });

            //socket.emit('playcard', { game_number: game_number, player: playerPos, cards: ["1", "3", "5"] });
            socket.on('playcard', function(data) {
                var game = gameServer.findGame(parseInt(data.game_number, 10)),
                    iPlayerPos = parseInt(data.player,10),
                    oPlayer = game.playCards(iPlayerPos, data.cards);

                //as a result from playing a card, the player gets move or attack points, abilities
                //update the player while is his move
                socket.emit('playerupdate', JSON.stringify(oPlayer));
            });
        });
};