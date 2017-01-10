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
                    self.nextHandeler(url, function(likes) {
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
    var getAllPostLikes = function(accessToken, posts, cb) {
        var maxP  = 20; // Maximum number of get requests in parallel
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
    };

    var startAnimation = function(cb) {
        $('#AccessTokenInput')
            .css({ width: '450px', borderTopRightRadius: '4px', borderBottomRightRadius: '4px' })
            .val('')
            .attr('placeholder', '');
        $('#AccessTokenButton')
            .css({ borderTopRightRadius: '0px', borderBottomRightRadius: '0px', height: '36px' })
            .html('')
            .animate({ right: '400px' }, 500, function() {
                cb();
            });
    };

    var animationStatus = 'Fetching profile information';

    var continueAnimation = function() {
        console.log('1');
        $('.LoadingStatus')
            .show()
            .html(animationStatus)
            .textillate().on('outAnimationEnd.tlt', function() {
                continueAnimation();
            });
            setTimeout(function() {
                animationStatus = 'Doing something else';
            }, 10)
    };
    
    // Initialize and fetch facebook info
    var init = function() {
        var accessToken = document.getElementById('AccessTokenInput').value;
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
        });
    };

     var textillateOptionsLoading = {
                selector: '.texts',
                loop: false,
                minDisplayTime: 200,
                initialDelay: 0,
                autoStart: true,
                inEffects: [],
                outEffects: [],
                in: {
                    effect: 'flash',
                    delayScale: 1,
                    delay: 10,
                    sync: false,
                    shuffle: false,
                    reverse: false,
                    callback: function () {}
                },
                out: {
                    effect: 'flash',
                    delayScale: 1,
                    delay: 10,
                    sync: false,
                    shuffle: false,
                    reverse: false,
                    callback: function () {}
                },
                callback: function () {
                    continueAnimation();
                },
                type: 'char'
            }

    startAnimation(continueAnimation);
}

setTimeout(function() {
    fetchFacebookData();
}, 5000);



