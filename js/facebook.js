var globalData  = {};

function fetchFacebookData() {
    // Get User Profile
    var getProfile = function (accessToken, cb) {
        var url = "https://graph.facebook.com/v2.8/me?fields=email%2Cname%2cid&access_token=" + accessToken;
        $.get(url, function(result) {
            cb(result);
        });
    };

    // Get All Posts
    var getPosts = function(accessToken, userId, cb) {
        var url  = "https://graph.facebook.com/v2.8/" + userId + '/posts?access_token=' + accessToken;
        nextHandeler(url, cb);        
    };

    // Handle Get requests where result.paging.next may be returned
    var nextHandeler = function (url, cb) {
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
    };

    // Get likes in parallel
    var getLikes = function (accessToken, posts, cb) {
        var tasks = [];
        _.each(posts, function(post) {
            var task = (function(post) {
                return function(callback) {
                    var url = "https://graph.facebook.com/v2.8/" + post.id + "/likes?access_token=" + accessToken;
                    nextHandeler(url, function(likes) {
                        post.likes = likes;
                        callback(null, post);
                    })
                }
            })(post);
            tasks.push(task);
        });
        async.parallel(tasks, cb);
    };
    
    // Get all likes in series
    var getAllPostLikes = function(accessToken, posts, animationUpdate, cb) {
        var maxP  = 20; // Maximum number of get requests in parallel
        var tasks = [];
        for(var i=0; i<posts.length; i+=maxP) {
            var subArray = posts.slice(i, i+maxP);
            var task = (function(posts, i) {
                return function(callback) {
                    animationUpdate((50 + i/posts.length)/100);
                    getLikes(accessToken, posts, callback);
                }
            })(subArray, i);
            tasks.push(task);
        }
        async.series(tasks, function(err, postData) {
            var postsNew = [];
            _.each(postData, function(posts) {
                postsNew = postsNew.concat(posts);
            })
            cb(postsNew);
        });
    };

    var Animation = function(cb) {
        var self = this;
        self.startInitialAnimation();
        self.animationStatus = 'Fetching profile information';
        self.repeatAnimation = setInterval(function() {
            $('.LoadingStatus').show().html(self.animationStatus);
        }, 100);
    };

    Animation.prototype.startInitialAnimation = function() {
        $('#AccessTokenInput')
            .css({ width: '450px', borderTopRightRadius: '4px', borderBottomRightRadius: '4px' })
            .val('')
            .attr('placeholder', '');
        $('#AccessTokenButton')
            .css({ borderTopRightRadius: '0px', borderBottomRightRadius: '0px', height: '36px' })
            .html('')
            .animate({ right: '400px' }, 500);
    };

    Animation.prototype.updateProgress = function(percent) {
        var width = percent*450>50 ? percent*450 : 50;
        var right = (450-width) + 'px';
        $('#AccessTokenButton').animate({ width: width, right: right }, 500);
    };

    Animation.prototype.updateStatus = function(str) {
        this.animationStatus = str;
    };

    Animation.prototype.end = function() {
        clearInterval(this.repeatAnimation);
         $('.LoadingStatus').hide()
    };
    
    // Initialize and fetch facebook info
    (function init() {
        var accessToken = document.getElementById('AccessTokenInput').value;
        var animation   = new Animation();
        async.waterfall([
            function(cb) {
                animation.updateStatus('Fetching public profile..');
                getProfile(accessToken, function(profile) {
                    animation.updateProgress(20/100);
                    globalData.profile = profile;
                    cb();
                });
            },
            function(cb) {
                animation.updateStatus('Fetching all posts..');
                getPosts(accessToken, globalData.profile.id, function(posts) {
                    animation.updateProgress(50/100);
                    globalData.posts = posts;
                    cb();
                });
            },
            function(cb) {
                animation.updateStatus('Fetching post likes..');
                getAllPostLikes(accessToken, globalData.posts, animation.updateProgress, function(posts) {
                    globalData.posts = posts;
                    cb();
                });
            }
        ], function(err) {
            animation.updateProgress(100/100);
            animation.end();
            var blob = new Blob([JSON.stringify(globalData)], {type: "text/plain;charset=utf-8"});
            saveAs(blob, "globalData.txt");
        });
    })();

}