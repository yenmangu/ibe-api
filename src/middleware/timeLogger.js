function timeLogger(req, res, next) {
	console.log('Time: ', Date());
	next();
}

module.exports = timeLogger;
