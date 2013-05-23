/* 
 * Set up bindings for real server. 
 * Handle handshake between clientServer and clientBrowser
 */

/* Load in dependencies */
var config = require('getconfig'),
    http = require('http'),
    fs = require('fs');
var app = require('express')();

/* Create the peer server for the app */
var PeerServer = require('peer').PeerServer;
var peerServer = new PeerServer({ port: 9000 });

/* Create the file server for the app */
var server = require('http').createServer(app);

var port = process.env.PORT || config.server.port || 5000;
/* Start the server at the port. */
server.listen(port, function() {
  console.log('Server running at port ' + port);
});

/* Static file mappings */
app.param('filename');

app.get('/server', function(req, res) {
  res.sendfile(__dirname + '/server/index.html');
});

app.get('/server/:filename(*)', function(req, res) {
  var filename = req.params.filename;
  res.sendfile(__dirname + '/server/' + filename);
});

app.get('/connect/:serverid(*)', function(req, res) {
  var serverid = req.params.serverid;
  res.sendfile(__dirname + '/client/index.html');
});

app.get('/client/:filename(*)', function(req, res) {
  var filename = req.params.filename;
  res.sendfile(__dirname + '/client/' + filename);
});

app.get('/shared/:filename(*)', function(req, res) {
  var filename = req.params.filename;
  res.sendfile(__dirname + '/shared/' + filename);
});

// /* Temporary mapping kept at the bottom just for testing test files 
//     outside of the server browser. */
// app.get('/test', function(req, res) {
//   var filename = req.params.filename;
//   res.sendfile(__dirname + '/test_files/wrapper.html');
// });

// /* Temporary mapping kept at the bottom just for testing. TODO remove. */
// app.get(':filename(*)', function(req, res) {
//   var filename = req.params.filename;
//   res.sendfile(__dirname + '/test_files/bootstrap-example/' + filename);
// });

app.get("/", function(req, res) {
  res.sendfile(__dirname + '/home/index.html');
})

/* Set UID of process from config if applicable */
if (config.uid) {
  process.setuid(config.uid);
}
