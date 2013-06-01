var mgr = require('./domainQueryMgr.js');


var app = require('express')()
//var app = require('http').createServer(handler)
    , server = require('http').createServer(app)
    , io = require('socket.io').listen(server)
    , fs = require('fs')

server.listen(80);

app.get('/', function (req, res) {
    console.log('\n\n ** get / called');
    res.sendfile(__dirname + '/web/index.html');
});
//app.get('/javascript/*', function (req, res) {
//    console.log('\n\n ** get /javascript/ called: ' + req.url);
//    res.sendfile(__dirname + '/web' + req.url);
//});
app.get('/*', function (req, res) {
    console.log('\n\n ** get: ' + req.url);
    res.sendfile(__dirname + '/web' + req.url);
});



//function handler (req, res) {
//    console.log('\n\n ******** req  ***********\n\n');
//    console.dir(req);
//
//    fs.readFile(__dirname + '/web/index.html',
//        function (err, data) {
//            if (err) {
//                res.writeHead(500);
//                return res.end('Error loading index.html');
//            }
//
//            res.writeHead(200);
//            res.end(data);
//        });
//}

io.sockets.on('connection', function (socket) {

    console.log('\n\n *** connection \n\n')

//    socket.emit('news', { hello: 'world' });
//    socket.on('message', function(message, callback) {
//        console.log('message coming in.... ');
//        console.log(message);
//    });
    socket.on('searchDomains', function(domainMask, callback) {

        console.log('searchDomains: ' + domainMask);

        // [0]: domains to check (generate up to n)
        // [1]: batch size
        // [2]: show response xml
        mgr.checkDomains(
            domainMask,
            3,
            true,
            resultsReceived,
            errorHandler
        );
        function errorHandler(err) {
            socket.emit('error', err);
        }
        function resultsReceived(result) {

            console.log(' *** results received ** ' + mgr.results.length);
//            if (err)    {
//                socket.emit('error', err);
//                console.dir(err);
////                console.log(' *** ERORR (resultsReceived): ' + err);
//            }

            if (callback)
                callback(result);
        }


    }) ;
});

