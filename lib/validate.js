var facebook = require(__dirname + '/facebook.js');
var validate = {};

validate.facebook = function(req, res, next) {
	if(!req.body.accessToken) {
		next(new Error('Invalid accessToken'));
		return;
	}

	facebook.getProfile(req.body.accessToken, function(err, res) {
		if(err) {
			next(err);
			return;
		}
		req.profile = res;
		next();
	})
};

module.exports = validate;