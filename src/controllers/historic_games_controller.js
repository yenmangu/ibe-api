const sendToRemote = require('../services/remote/send_to_remote');
const ClientError = require('../services/custom_error');

function returnError(message, status) {
	return new ClientError(message || 'Bad Request', status || 400);
}

exports.validateRequest = async (req, res, next) => {
	try {
		const body = req.body;
		const { gameCode, dirKey, zipName } = body;

		if (!body) {
			const clientError = returnError('No body in request', 400);
			return res.status(clientError.status).json(clientError.message);
		}

		if (!gameCode || !dirKey) {
			const clientError = returnError('No authentication provided', 401);
			return res.status(clientError.status).json(clientError.message);
		}

		if (!zipName) {
			const clientError = returnError('No ZIPNAME provided', 400);
			return res.status(clientError.status).json(clientError.message);
		}

		next();
	} catch (error) {
		next(error);
	}
};

exports.restoreGame = async (req, res, next) => {
	try {
		console.log('restore historic games');

		const body = req.body;

		const { gameCode, dirKey, zipName } = body;

		// if (!body) {
		// 	const clientError = returnError('No body in request', 400);
		// 	return res.status(clientError.status).json(clientError.message);
		// }

		// if (!gameCode || !dirKey) {
		// 	const clientError = returnError('No authentication provided', 401);
		// 	return res.status(clientError.status).json(clientError.message);
		// }

		// if (!zipName) {
		// 	const clientError = returnError('No ZIPNAME provided', 400);
		// 	return res.status(clientError.status).json(clientError.message);
		// }

		const payload = `${gameCode}\n${dirKey}\n${zipName}`;

		const response = await sendToRemote.restoreGame(payload);

		console.log('response from remote: ', response);

		let result = {
			success: false
		};

		if (response.trim() === 'success') {
			result.success = true;
		} else {
			const responseLines = response.split('\n');
			if (responseLines[0].trim() === 'failure') {
				if (responseLines[1]) {
					result.success = false;
					result.errorCode = responseLines[1].trim();
				} else {
					return res.status(500).json({
						message: 'Internal Server Error - Invalid response from remote',
						result,
						remote: response
					});
				}
				return res.status(500).json({ message: 'Internal Server Error', result });
			}
			console.log('result: ', result);
		}
		res.status(200).json({ result });
	} catch (error) {
		console.error('Error in historic games controller');
		next(error);
	}
};

exports.deleteGame = async (req, res, next) => {
	try {
		console.log('Reached deleteGame.');
		res.status(200).json({ status: 'success', data: req.body });
	} catch (error) {
		next(error);
	}
};
