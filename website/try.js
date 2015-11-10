'use strict';

const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

//var qs = require('querystring');
//var _2MB = 2 * 1024 * 1024;
//
//var routes = {
//    'GET': {
//        '/': function(req, res) {
//            res.writeHead(200, { 'Content-type': 'text/html'});
//            res.end("<h1>Hello Router!</h1>");
//        },
//        '/about': function(req, res) {
//            res.writeHead(200, { 'Content-type': 'text/html'});
//            res.end("<h1>This is the about page!</h1>");
//        },
//        '/api/getinfo': function(req, res) {
//            //todo: fetch data from db
//            res.writeHead(200, { 'Content-type': 'application/json'});
//            res.end(JSON.stringify(req.queryParams));
//        }
//    },
//    'POST': {
//        '/api/login': function(req, res) {
//            var body = '';
//
//            req.on('data', function(data) {
//                body += data;
//                if (body.length > _2MB) {
//                    res.writeHead(413, { 'Content-type': 'text/html' });
//                    res.end('<h3>Error - request body is larger than 2MB</h3>');
//
//                    //req.connection.destroy();
//                }
//            });
//
//            req.on('end', function() {
//                var params = qs.parse(body);
//                console.log('Username: ', params['username']);
//                console.log('Passcode: ', params['passcode']);
//                //todo: Query a db to see if the user exists
//                //If so, return a JSON data related to the user
//                res.end();
//            });
//        }
//    },
//    'NA': function(req, res) {
//        res.writeHead(404);
//        res.end("Content not found!");
//    }
//};
//
//function router(req, res) {
//    var baseUrl = url.parse(req.url, true);
//    //console.log('Requested route: ', baseUrl);
//
//    var resolveRoute = routes[req.method][baseUrl.pathname];
//
//    if (resolveRoute !== undefined) {
//        req.queryParams = baseUrl.query;
//        resolveRoute(req, res);
//    } else {
//        routes['NA'](req, res);
//    }
//}
//
//http.createServer(router)
//    .listen(process.env.PORT || 5000, function() {
//        console.log('server running on port ' + (process.env.PORT || 5000));
//    });

var mimes = {
    '.htm': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.gif': 'image/gif',
    '.jpg': 'image/jpeg',
    '.png': 'image/png'
};

function webserver(req, res) {
    // if the route requested is '/', then load 'index.htm' or else
    // load the requested file(s)

    var baseURI = url.parse(req.url);
    var filepath = __dirname + (baseURI.pathname === '/' ? '/index.html' : baseURI.pathname);

    // Check if the requested file is accessible or not
    fs.access(filepath, fs.F_OK, function(error) {
        if(!error) {
            // Read and Serve the file over response
            fs.readFile(filepath, function(error, content) {
                if (!error) {
                    console.log('Serving: ', filepath);
                    // Resolve the content type
                    var contentType = mimes[path.extname(filepath)]; // mimes['.css'] === 'text/css'
                    // Serve the file from the buffer
                    res.writeHead(200, {'Content-type': contentType});
                    res.end(content, 'utf-8');
                } else {
                    // Serve a 500
                    res.writeHead(500);
                    res.end('The server could not read the file requested.');
                }
            });
        } else {
            // Serve a 404
            res.writeHead(404);
            res.end('Content not found!');
        }
    });
}

http.createServer(webserver)
    .listen(process.env.PORT || 5000, function() {
        console.log('server running on port ' + (process.env.PORT || 5000));
    });