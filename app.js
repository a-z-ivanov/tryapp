'use strict';

const express = require('express'),
    app = express(),
    path = require('path'),
    router = require('./routes/router.js'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    config = require('./configs/config.js'),
    ConnectMongo = require('connect-mongo')(session);

app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('hogan-express'));
app.set('view engine', 'html');
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

var env = process.env.NODE_ENV || 'development';
if (env === 'development') {
    //development
    app.use(session({ secret: config.sessionSecret }));
} else {
    app.use(session({
        secret: config.sessionSecret,
        store: new ConnectMongo({
            url: config.dbURL,
            stringify: true
        })
    }));
}

router(express, app);

app.listen(process.env.PORT || 5000, function() {
    console.log('server running on port ' + (process.env.PORT || 5000));
    console.log("Mode:", env);
});