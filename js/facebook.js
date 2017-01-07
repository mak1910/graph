var globalData  = {};
var facebook    = {};

facebook.init = function() {
    var self    = this;
    accessToken = document.getElementById('AccessTokenInput').value;
    
    async.waterfall([
        function(cb) {
            self.getProfile(accessToken, function(profile) {
                globalData.profile = profile;
                cb();
            });
        },
        function(cb) {
            self.getPosts(accessToken, globalData.profile.id, function(posts) {
                globalData.posts = posts;
                cb();
            });
        }
    ], function(err) {
        console.log(globalData);
    })
}

facebook.getProfile = function (accessToken, cb) {
    var url = "https://graph.facebook.com/v2.8/me?fields=email%2Cname%2cid&access_token=" + accessToken;
    $.get(url, function(result) {
        cb(result);
    });
}

facebook.getPosts = function (accessToken, userId, cb) {
    var self = this;
    var url  = "https://graph.facebook.com/v2.8/" + userId + '/posts?access_token=' + accessToken;
    self.nextHandeler(url, cb);
}

facebook.nextHandeler = function (url, cb) {
    var self = this;
    $.get(url, function(result) {
        if(result && result.paging && result.paging.next && result.data.length != 0) {
            self.nextHandeler(result.paging.next, function(data) {
                cb(result.data.concat(data));
            });
        } else {
            cb(result.data);
        }
    }).fail(function() {
        cb([]);
    });
}

facebook.getLikes = function (accessToken, postId, cb) {
    var url = "https://graph.facebook.com/v2.8/" + postId + "/likes?access_token=" + accessToken;
    nextHandeler(url, cb);
}

facebook.getAllPostLikes = function (accessToken, posts, cb) {
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
        cb(likes);
    })
}