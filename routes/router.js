var express = require('express');
var router = express.Router();
var GameModel = require('../models/gamemodel.js');

function securePages(req, res, next){
    if(req.isAuthenticated()){
        next();
    } else {
        res.redirect('/');
    }
}

module.exports = function(passport, config, gameServer) {

    /* GET login page. */
    router.get('/', function(req, res) {
        // Display the Login page with any flash message, if any
        res.render('login_page', { message: req.flash('message') });
    });

    /* Handle Login POST */
    router.post('/login', passport.authenticate('login', {
        successRedirect: '/lobby',
        failureRedirect: '/',
        failureFlash : true
    }));

    /* GET Registration Page */
    router.get('/signup', function(req, res){
        res.render('register',{message: req.flash('message')});
    });

    /* Handle Registration POST */
    router.post('/signup', passport.authenticate('signup', {
        successRedirect: '/lobby',
        failureRedirect: '/signup',
        failureFlash : true
    }));

    /* GET Home Page */
    router.get('/lobby', securePages, function(req, res) {
        console.log("Username: " + req.user.username);

        // if this user has started games, put him in the last one
        // if not - show him the lobby
        GameModel.find({'game.players.user': req.user.username, 'game.started': true }, function(err, games) {
            if (games && games.length) {
                res.redirect('/home/' + games[games.length - 1].gamenumber);
            } else {
                res.render('lobby', {user: req.user, host: config.host});
            }
        });
    });

    /* GET Home Page */
    router.get('/home/:game_id', securePages, function(req, res) {
        console.log("User " + req.user + " redirected to /home");

        var iGameId = parseInt(req.params.game_id, 10);
        gameServer.getGame(iGameId, function(game) {
            var player = game.getPlayerPositionAndSquare(req.user.username);
            res.render('home', { user: req.user, host: config.host, game_number: iGameId, playerPos: player.position, activePlayerPos: game.activePlayer, mapX: player.square.x, mapY: player.square.y});
        });
    });

    /* Handle Logout */
    router.get('/signout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    return router;
};





