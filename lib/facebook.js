var getProfileUrl = "https://graph.facebook.com/v2.8/me?fields=email%2Cname%2cid&access_token=";
var getPostsUrls = ["https://graph.facebook.com/v2.8/", "/posts?access_token="];
var getLikesUrls = ["https://graph.facebook.com/v2.8/", "/likes?access_token="];

var request = require('request');
var proxy 	= process.env['http_proxy'];
var options = {};
if(proxy) {
	options.proxy = proxy;
}

var nextHandeler = function(url, cb) {
	request(url, options, function(err, res, body) {
		if(err) {
			cb(err);
			return;
		}

		var result = JSON.parse(body);
		if(result.error) {
			cb(new Error(result.error.message));
			return;
		}

		var data = result.data;
		
		if(result.paging) {
			if(!result.paging.next || data.length == 0) {
				cb(null, data);
			} else {
				nextHandeler(result.paging.next, function(err, additionalData) {
					data = data.concat(additionalData);
					cb(err, data);
				})
			}
		} else {
			cb(err, data);
		}
	});
}

var facebook = {};

facebook.getProfile = function(accessToken, cb) {
	request(getProfileUrl + accessToken, options, function(err, res, body) {
		if(err) {
			cb(err);
			return;
		}

		var result = JSON.parse(body);
		if(result.error) {
			cb(new Error(result.error.message));
			return;
		}

		cb(null, result);
	});
}

facebook.getAllPosts = function(accessToken, userId, cb) {
	request(getPostsUrls[0] + userId + getPostsUrls[1] + accessToken, options, function(err, res, body) {
		if(err) {
			cb(err);
			return;
		}

		var result = JSON.parse(body);
		if(result.error) {
			cb(new Error(result.error.message));
			return;
		}

		var data = result.data;

		if(result.paging && result.paging.next) {
			nextHandeler(result.paging.next, function(err, additionalData) {
				data = data.concat(additionalData);
				cb(null, data);
			})
		} else {
			cb(null, data);
		}

	});
}

facebook.getAllLikes = function(accessToken, postId, cb) {
	request(getLikesUrls[0] + postId + getLikesUrls[1] + accessToken, options, function(err, res, body) {
		if(err) {
			cb(err);
			return;
		}

		var result = JSON.parse(body);
		if(result.error) {
			cb(new Error(result.error.message));
			return;
		}

		var data = result.data;

		if(result.paging && result.paging.next) {
			nextHandeler(result.paging.next, function(err, additionalData) {
				data = data.concat(additionalData);
				cb(null, data);
			})
		} else {
			cb(null, data);
		}

	});
}

module.exports = facebook;