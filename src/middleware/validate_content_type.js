function validateContentType(expectedType) {
	return function (req, res, next) {
		// console.log('expectedType: ', expectedType.toLowerCase());
		// console.log('headers: ', req.headers);
		const contentType = req.headers['content-type'];
		if (!contentType) {
			return res.status(400).send('Bad Request: Missing Content-Type Headers');
		}
		if (contentType !== expectedType) {
			return res.status(415).send('Unsupported Media Type');
		}
		next();
	};
}

module.exports = { validateContentType };
