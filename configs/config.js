module.exports = function() {
	function getEnvironmentVariables() {
		return {
			"dbURL": process.env.MONGODB_URI,
			"sessionSecret": process.env.SESSION_SECRET,
			"host": "https://" + process.env.APP_NAME + ".herokuapp.com"
		}
	}

	if (process.env.NODE_ENV) { //production
		return getEnvironmentVariables();
	} else {
		return require('./development.json');
	}
}();