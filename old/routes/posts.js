var fs 		= require('fs');
var async 	= require('async');
var express = require('express');
var exec 	= require('child_process').exec;
var posts 	= express.Router();

var facebook = require(__dirname + '/../lib/facebook.js');

posts.post('/likes', function(req, res, next) {
	async.waterfall([
		function(cb) {
			facebook.getAllPosts(req.body.accessToken, req.profile.id, cb);
		},
		function(posts, cb) {
			var tasks = [];
			posts.forEach(function(post) {
				if(post && post.id) {
					var task = (function(post) {
						return function(callback) {
							facebook.getAllLikes(req.body.accessToken, post.id, function(err, likes) {
								post.likes = likes;
								callback(null, post);
							})
						}
					})(post);
					tasks.push(task);
				}
			})
			async.parallel(tasks, cb);
		},
		function(posts, cb) {
			var file = __dirname + '/../' + req.profile.id + '.log';
			fs.writeFile(file, JSON.stringify(posts), function(err) {
				cb(err, file);
			});
		},
		function(file, cb) {
			exec('FILE=' + file + ' node ' + __dirname + '/../tasks/sortLikes.js', function(err, stdout, stderr) {
				if(err) {
					cb(err);
					return;
				}

				if(stderr) {
					cb(new Error(stderr));
					return;
				}

				cb(null, JSON.parse(stdout));
			})
		}
	], function(err, result) {
		if(err) {
			next(err);
			return;
		}
		req.sendData = result;
		next();
	})
});

module.exports = posts;