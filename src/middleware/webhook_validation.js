const dotenv = require('dotenv').config();

const token = process.env.WEBHOOK_TOKEN;

function validateRequest(req, res, next) {
	console.log("Validate Request 'req' : ", req.headers);
	// console.log(token);
	const authHeader = req.header('Authorization');

	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return res
			.status(401)
			.send('Unauthorized: Missing or Invalid Authorization Header');
	}

	const incomingToken = authHeader.substring('Bearer '.length);

	if (token !== incomingToken) {
		return res.status(401).send('Unauthorized: Invalid Token');
	}
	next();
}

module.exports = { validateRequest };
