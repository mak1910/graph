'use strict';

var colors = require('colors');
colors.setTheme({
  	silly	: 'rainbow',
  	info	: 'green',
  	data	: ['white', 'underline'],
  	warn	: 'yellow',
  	debug	: 'blue',
  	error	: 'red',
  	log 	: 'cyan'
});

var devLogger = {
	silly : function(str) {
		console.log(str['silly']);
	},
	info : function(str) {
		console.log(str['info']);
	},
	log : function(str) {
		console.log(str['log']);
	},
	debug : function(str) {
		console.log(str['debug']);
	},
	error : function(str) {
		console.log(str['error']);
	},
	warn : function(str) {
		console.log(str['warn']);
	},
	data : function(str) {
		console.log(str['data']);
	}
};

var env = process.env;
var obj = {};

obj.env = env['NODE_ENV'] || 'development';

if(obj.env === 'development') {
	obj.logger = devLogger;
}

obj.port = 3000;

module.exports = obj;