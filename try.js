'use strict';

const http = require('http');

http.createServer(function(req, res) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<h1>Try me!</h1>');
})
    .listen(3000, function() { console.log('server running on port 3000'); });

