const sendToRemote = require('../services/remote/send_to_remote');

function returnError(message, status) {
	const clientError = new Error();
	clientError.message = message || 'Bad Request';
	clientError.status = status || 400;
	return clientError;
}

exports.historicGamesController = async (req, res, next) => {
	try {
		console.log('restore historic games');

		const body = req.body;
		let clientError;
		if (!body) {
			clientError = returnError('No body in request', 400);
			return res.status(clientError.status).json(clientError.message);
		}

		const { gameCode, dirKey, zipName } = body;

		if (!gameCode || !dirKey) {
			clientError = returnError('No authentication provided', 401);
			return res.status(clientError.status).json(clientError.message``);
		}

		if (!zipName) {
			clientError = returnError('No ZIPNAME provided', 400);
			return res.status(clientError.status).json(clientError.message);
		}

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
