var accessToken = 'EAACEdEose0cBALUvsMa0WIZBpvxXB3z7uA02u6pegrr6im6RGT53ZAX8J5RL0hwA7t2OQre5gVwagMvG32Iu4USTzkbX6zA8xc3QLgqf5oZBKEQXo5so56fZAIJWqMIDTre2yXMavpEGYSIs5kni2DcTDRGZAJIPq3ZBPDXIihCAZDZD';

function print(obj) {
	console.log(obj);
}

function getProfile(accessToken, cb) {
	var url = "https://graph.facebook.com/v2.8/me?fields=email%2Cname%2cid&access_token=" + accessToken;
	$.get(url, function(result) {
		cb(result);
	});
}

function nextHandeler(url, cb) {
	$.get(url, function(result) {
		if(result && result.paging && result.paging.next && result.data.length != 0) {
			nextHandeler(result.paging.next, function(data) {
				cb(result.data.concat(data));
			});
		} else {
			cb(result.data);
		}
	}).fail(function() {
		cb([]);
	});
}

function getPosts(accessToken, userId, cb) {
	var url = "https://graph.facebook.com/v2.8/" + userId + '/posts?access_token=' + accessToken;
	nextHandeler(url, cb);
}

function getLikes(accessToken, postId, cb) {
	var url = "https://graph.facebook.com/v2.8/" + postId + "/likes?access_token=" + accessToken;
	nextHandeler(url, cb);
}

function getAllPostLikes(accessToken, posts, cb) {
	var tasks = [];
	_.each(posts, function(post) {
		if(post && post.id) {
			var task = (function(post) {
				return function(callback) {
					getLikes(accessToken, post.id, function(data) {
						callback(null, data);
					});
				}
			})(post);
			tasks.push(task);
		}
	});
	async.parallel(tasks, function(err, likes) {
		console.log(err);
		console.log(likes);
		cb(likes);
	})
}

getProfile(accessToken, function(user) {
	getPosts(accessToken, user.id, function(posts) {
		getAllPostLikes(accessToken, posts, print);
	});
});