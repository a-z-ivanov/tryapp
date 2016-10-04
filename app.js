process.env.NODE_ENV && require('newrelic');
var express = require('express');
var expressSession = require('express-session');
var ConnectMongo = require('connect-mongo')(expressSession);
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var config = require('./configs/config.js');
var mongoose = require('mongoose');

// Connect to DB
mongoose.connect(config.dbURL);

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('hogan-express'));
app.set('view engine', 'html');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//init sessions
//app.use(expressSession({secret: config.sessionSecret}));

var env = process.env.NODE_ENV || 'development';
if(env === 'development'){
    // dev specific settings
    app.use(expressSession({secret:config.sessionSecret}));
} else {
    // production specific settings
    app.use(expressSession({
        secret:config.sessionSecret,
        store: new ConnectMongo({
            db: config.dbURL,
            mongooseConnection:mongoose.connections[0],
            stringify:true
        })
    }));
}

// Configuring Passport
var passport = require('passport');
app.use(passport.initialize());
app.use(passport.session());

// Using the flash middleware provided by connect-flash to store messages in session
// and displaying in templates
var flash = require('connect-flash');
app.use(flash());

// Initialize Passport
var initPassport = require('./auth/init');
initPassport(passport);

var GameServer = require('./game/gameserver.js');
var gameServer = new GameServer();

var routes = require('./routes/router')(passport, config, gameServer);
app.use('/', routes);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.set('port', process.env.PORT || 5000);

var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

require('./socket/socket.js')(io, gameServer);

server.listen(app.get('port'), function() {
    console.log('server running on port ' + app.get('port'));
    console.log("Mode:", env);
});
