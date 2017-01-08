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
        },
        function(cb) {
            self.getAllPostLikes(accessToken, globalData.posts, function(posts) {
                globalData.posts = posts;
                cb();
            });
        }
    ], function(err) {
        var blob = new Blob([JSON.stringify(globalData)], {type: "text/plain;charset=utf-8"});
        saveAs(blob, "globalData.txt");
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

facebook.getLikes = function (accessToken, posts, cb) {
    var self  = this;
    var tasks = [];

    _.each(posts, function(post) {
        var task = (function(post) {
            return function(callback) {
                var url = "https://graph.facebook.com/v2.8/" + post.id + "/likes?access_token=" + accessToken;
                self.nextHandeler(url, function(likes) {
                    post.likes = likes;
                    callback(null, post);
                })
            }
        })(post);
        tasks.push(task);
    });

    async.parallel(tasks, cb);
}

facebook.getAllPostLikes = function(accessToken, posts, cb) {
    var self  = this;
    var maxP  = 50;
    var tasks = [];

    for(var i=0; i<posts.length; i+=maxP) {
        var subArray = posts.slice(i, i+maxP);
        var task = (function(posts) {
            return function(callback) {
                self.getLikes(accessToken, posts, callback);
            }
        })(subArray);
        tasks.push(task);
    }

    async.series(tasks, function(err, postData) {
        var postsNew = [];
        _.each(postData, function(posts) {
            postsNew = postsNew.concat(posts);
        })
        cb(postsNew);
    });
}