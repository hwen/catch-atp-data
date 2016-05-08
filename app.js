'use strict';

var express = require('express');
var bodyParser = require('body-parser');

var app = express();


app.use(bodyParser.urlencoded({
    limit: '5000mb',
    extended: true
}));

app.use(bodyParser.json({
    limit:'5000mb'
}));

app.use('/api', require('./lib'));

app.get('/', function(req, res) {
	res.sendfile('./index.html');
});

var server = require('http').createServer(app);

server.listen(2333, function() {
	console.log('Express server listening on %d', 2333);
});