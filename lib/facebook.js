var _	  = require('underscore');
var async = require('async');
var graph = require('fbgraph');
var fs    = require('fs');
var redis = require('redis');
var accessToken = 'EAACEdEose0cBANVR8HiZA6JLlINXv2kOCNMZAZCEcyZBPC8VbVmnhlNkuTkJlbjRdbbUZBfQHOEFOdh9YSrZACmIgCZAQ08jBGZBFakjqR7AP3l71MZChmeOIMNB0FIswAZBWvrjGugtnYOzWWLbWu3qtUCa32L3eHv6gh5BobiNysQAZDZD';
var counter  = {};
var numberoOfFriends = 0;

var getUserId = function(callback) {
	graph.get('me', {access_token: accessToken}, function(err, result) {
		callback(err, result.id);
	})
}

var getPosts = function(userId, param, callback) {
	var url = userId + '/posts';
	var options = { access_token: accessToken };
	if(param) {
		options = {};
		url = userId;
	}
	graph.get(url, options, function(err, result) {
		if(result) {
			if(result.data) {
				if(result.data.length == 0) {
					callback(null, []);
					return;
				}
				if(result.paging && result.paging.next) {
    				getPosts(result.paging.next, true, function(err, completedArray) {
    					var myArray = result['data'];
    					_.each(completedArray, function(item) {
    						myArray.push(item);
    					})
    					callback(null, myArray);
    				})
  				} else {
					callback(err, result['data']);
  				}
			} else {
				callback(null, []);
			}
		} else {
			callback(null, []);
		}
	})
}

var getListOfLikes = function(postId, callback) {
	graph.get(postId + '/likes', { access_token: accessToken, limit: 1000}, function(err, result) {
		if(result) {
			if(result['data']) {
				var data = result['data'];
				for(var i=0; i<data.length; i++) {
					if(counter[data[i].id]) {
						counter[data[i].id]['likes']++;
					} else {
						counter[data[i].id] = {
							data: data[i],
							likes: 1
						}
					}
				}
				callback(err, data);
			} else {
				callback(null, null);
			}
		} else {
			callback(null, null);
		}
	});
}

var printSortedArray = function() {
	var likesIndexMap = [];
	_.each(counter, function(person) {
		numberoOfFriends++;
		var likes = person.likes;
		var id    = person.data.id;
		if(likesIndexMap[likes]) {
			likesIndexMap[likes].push(id);
		} else {
			likesIndexMap[likes] = [];
			likesIndexMap[likes].push(id);
		}
	})

	for(var i=0; i<likesIndexMap.length; i++) {
		if(likesIndexMap[i]) {
			var data = likesIndexMap[i];
			for(var j=0; j<data.length; j++) {
				var field = counter[data[j]];
				console.log(field.likes + ' - ' + field.data.name);
			}
		}
	}
	console.log(numberoOfFriends + ' Number of friends.')
}

getUserId(function(err, userId) {
	getPosts(userId, false, function(err, posts) {
		var tasks = [];
		var numberOfPosts = posts.length;
		console.log('Got ' + numberOfPosts + ' posts.')
		_.each(posts, function(post, index) {
			var task = (function(post, index) {
				return function(_callback) {
					getListOfLikes(post.id, function(err, result) {
						console.log('*** Completed ' + index + ' out of ' + numberOfPosts + ' ***');
						_callback(err, { postId: post.id, likes: result });
					})
				}
			})(post, index);
			tasks.push(task);
		})
		async.parallel(tasks, function(err, result) {
			printSortedArray();
			fs.writeFileSync(__dirname + '/data.txt', JSON.stringify(result));
		})
	})
})