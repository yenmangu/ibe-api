function includeUrl(req, res, next) {
	const host = req.headers.origin;
	const isIPAddress = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host);

	if (isIPAddress) {
		console.log(`Request from IP address: ${host}`);
	} else {
		console.log(`Request from domain: ${host}`);
	}
	next();
}

function logHeaders(req, res, next) {
	const headers = req.headers;
	console.log(headers);

	next();
}

module.exports = { includeUrl, logHeaders };
