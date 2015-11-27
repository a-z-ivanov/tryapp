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
            console.log("socket.id: ", socket.id);

            var map = require('../models/map.json');
            socket.emit('mapupdate', JSON.stringify(map));
        });
};