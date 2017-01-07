'use strict';

var express = require('express');
var config 	= require(__dirname + '/config/index.js');
var logger  = config.logger;

var app = express();

app.use(express.static(__dirname + '/public'));
app.use('/bower_components', express.static(__dirname + '/bower_components'));

app.use(function(req, res, next) {
	if(req.method && req.originalUrl)
		logger.debug('Received ' + req.method + ' request at ' + req.originalUrl);
	next();
});

var bodyParser 	 = require('body-parser');
var cookieParser = require('cookie-parser');
var validate 	 = require(__dirname + '/lib/validate.js');
var posts 		 = require(__dirname + '/routes/posts.js');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/posts', validate.facebook, posts);

// Finally, error handeling and 404

app.use(function(req, res, next) {
	if(req.sendData)
		res.json(req.sendData);
	else
		next();
});

app.use(function(req, res, next) {
	res.sendStatus(404);
});

app.use(function(err, req, res, next) {
	logger.error(err.stack);
	res.status(500).send(err.message);
});

app.listen(config.port, function() {
	logger.silly('Listening on port ' + config.port);
});