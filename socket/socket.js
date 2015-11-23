module.exports = function(io, games) {
    var gamelist = io.of('/gamelist')
        .on('connection', function(socket) {
            console.log('Socket.io connection established!');
            socket.emit('gameroomupdate', JSON.stringify(games));

            socket.on('newgame', function(data) {
                console.log(data.username + " creates a new game!");

                games.push({
                    game_number: games.length
                });

                socket.broadcast.emit('gameroomupdate', JSON.stringify(games));
                socket.emit('gameroomupdate', JSON.stringify(games));
            });
        });
};