var file = process.env['FILE'];
var fs 	 = require('fs');
var _ 	 = require('underscore');

fs.readFile(file, 'utf8', function(err, result) {
	if(err) {
		console.error(err);
		process.exit(1);
	}
	main(JSON.parse(result));
})

var likesCounter = {};

var main = function(posts) {
	if(!_.isArray(posts)) {
		console.error('Posts not an array');
		process.exit(1);
	}

	var userLikesCount = {};
	var userNames = {};

	_.each(posts, function(post) {
		if(_.isArray(post.likes)) {
			_.each(post.likes, function(like) {
				if(like && like.id) {
					userNames[like.id] = like.name;
					if(userLikesCount[like.id]) {
						userLikesCount[like.id]++;
					} else {
						userLikesCount[like.id] = 1;
					}
				}
			})
		}
	})

	_.each(Object.keys(userLikesCount), function(key) {
		if(!likesCounter[userLikesCount[key]]) {
			likesCounter[userLikesCount[key]] = [];
		}
		likesCounter[userLikesCount[key]].push({ id: key, name: userNames[key] });
	})

	console.log(JSON.stringify(likesCounter));
}
