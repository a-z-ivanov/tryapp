module.exports = function(io, gameServer) {
    var gamelist = io.of('/gamelist')
        .on('connection', function(socket) {
            console.log('Socket.io connection to gamelist established!');
            var games = gameServer.getLobbyGames();

            socket.emit('gameroomupdate', JSON.stringify(games, gameServer.White_List_Properties_All_Games));

            socket.on('newgame', function(data) {
                console.log(data.username + " creates a new game!");

                gameServer.newGame(data.username, function(games) {
                    socket.broadcast.emit('gameroomupdate', JSON.stringify(games, gameServer.White_List_Properties_All_Games));
                    socket.emit('gameroomupdate', JSON.stringify(games, gameServer.White_List_Properties_All_Games));
                });
            });

            socket.on('joingame', function(data) {
                console.log(data.username + " joins game " + data.game_number + "!");
                gameServer.getGame(data.game_number, function(currentGame) {
                    if (currentGame.join(data.username)) {
                        if (currentGame.isFull()) {
                            //start game
                            currentGame.started = true;
                            gameServer.saveGame(data.game_number);
                            socket.broadcast.emit('startgame', JSON.stringify(currentGame, currentGame.White_List_Properties_No_Map));
                            socket.emit('startgame', JSON.stringify(currentGame, currentGame.White_List_Properties_No_Map));
                        }

                        var games = gameServer.getLobbyGames();
                        socket.broadcast.emit('gameroomupdate', JSON.stringify(games, gameServer.White_List_Properties_All_Games));
                        socket.emit('gameroomupdate', JSON.stringify(games, gameServer.White_List_Properties_All_Games));
                    } else {
                        //message game is full
                    }
                });
            });
        });

    var allUserSockets = {};
    var game = io.of('/game')
        .on('connection', function(socket) {
            console.log('Socket.io connection to game established!');

            socket.on('creategamechannel', function(data) {
                console.log("creating game channel: " + data.game_number);
                socket.username = data.username;
                socket.player = parseInt(data.player, 10);
                socket.game_number = parseInt(data.game_number, 10);
                socket.join(data.game_number);
                allUserSockets[socket.username] = socket;

                gameServer.getGame(socket.game_number, function(game) {
                    socket.emit('gameupdate', JSON.stringify(game));
                });
            });

            //socket.emit('move', { x: 2, y: 5, spentPoints: 2 });
            socket.on('move', function(data) {
                gameServer.getGame(socket.game_number, function(game) {
                    var oPlayer = game.getPlayerByPosition(socket.player);

                    game.playerMove(socket.player, parseInt(data.x, 10), parseInt(data.y, 10));
                    oPlayer.move -= parseInt(data.spentPoints, 10);

                    socket.broadcast.to(socket.game_number).emit('mapupdate', JSON.stringify(game.map));
                    socket.emit('mapupdate', JSON.stringify(game.map));
                    socket.emit('playerupdate', JSON.stringify(oPlayer));
                });
            });

            //socket.emit('reveal', { x: 2, y: 5, spentPoints: 2 });
            socket.on('reveal', function(data) {
                gameServer.getGame(socket.game_number, function(game) {
                    var oPlayer = game.getPlayerByPosition(socket.player);

                    game.playerReveal(parseInt(data.x, 10), parseInt(data.y, 10));
                    oPlayer.move -= parseInt(data.spentPoints, 10);
                    gameServer.saveGame(socket.game_number);

                    socket.broadcast.to(socket.game_number).emit('mapupdate', JSON.stringify(game.map));
                    socket.emit('mapupdate', JSON.stringify(game.map));
                    socket.emit('playerupdate', JSON.stringify(oPlayer));
                });
            });

            //socket.emit('playcard', { cards: ["1", "3", "5"] });
            socket.on('playcard', function(data) {
                gameServer.getGame(socket.game_number, function(game) {
                    console.log("playing cards...", data.cards);

                    var oPlayer = game.playCards(socket.player, data.cards);

                    //as a result from playing a card, the player gets move or attack points, abilities
                    //update the player while is his move
                    socket.emit('playerupdate', JSON.stringify(oPlayer));
                    socket.broadcast.to(socket.game_number).emit('playareaupdate', JSON.stringify(oPlayer.playedCards));
                });
            });

            socket.on('save', function(data) {
                gameServer.saveGame(socket.game_number);
                //emit and broadcast message for successful save
            });

            socket.on('load', function(data) {
                gameServer.loadGame(socket.game_number, function(game) {
                    socket.broadcast.to(socket.game_number).emit('gameupdate', JSON.stringify(game));
                    socket.emit('gameupdate', JSON.stringify(game));
                });
            });

            socket.on('endturn', function(data) {
                gameServer.getGame(socket.game_number, function(game) {
                    game.endTurn();
                    gameServer.saveGame(socket.game_number);

                    socket.broadcast.to(socket.game_number).emit('gameupdate', JSON.stringify(game));
                    socket.emit('gameupdate', JSON.stringify(game));
                });
            });
        });
};