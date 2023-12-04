const handActionsService = require('../../services/hand_actions_service');
const sendToRemote = require('../../services/remote/send_to_remote');
const remoteResponse = require('../../services/remote/remote_response');

function buildClientError(message, status) {
	const clientError = new Error('Bad Request');
	clientError.status = status ? status : 400;
	clientError.message = message ? message : '';
	Object.defineProperty(clientError, 'status', {
		enumerable: true,
		configurable: true,
		value: clientError.status
	});
	Object.defineProperty(clientError, 'message', {
		enumerable: true,
		configurable: true,
		value: clientError.message
	});

	return clientError;
}

// async function handleMovement(req, res, next) {
// 	try {
// 		if (!req.query) {
// 			const error = buildClientError('No query params in request', 400);
// 			return res.status(error.status).json(error);
// 		}
// 		const { gameCode, movement } = req.query;
// 	} catch (error) {
// 		next(error);
// 	}
// }

async function handleHtmlPdf(req, res, next) {
	try {
		// console.log('request: ', req);
		const inputTitle = req.body.title;
		if (Object.keys(req.query).length === 0) {
			const error = buildClientError('No query params in request', 400);
			console.error(error);
			return res.status(error.status).json(error);
		}
		// if()
		const { gameCode, TYPE } = req.query;
		if (TYPE === 'movement') {
			if (Object.keys(req.body).length === 0) {
				const error = buildClientError('No body in request', 400);
				console.error(error);
				return res.status(error.status).json(error);
			}
		}

		let options = {
			gameCode,
			TYPE,
			inputTitle,
			rankings: req.query.rankings ? req.query.rankings : 'f',
			fullResults: req.query.full_results ? req.query.full_results : 'f',
			handDiagrams: req.query.hand_diagrams ? req.query.hand_diagrams : 'f',
			personalScore: req.query.personal_score ? req.query.personal_score : 'f',
			fileType: req.body.fileType ? req.body.fileType : '',
			eventName: ''
		};
		console.log('options: ', options);

		if (TYPE === 'HTMLNEW') {
			console.log('req.body: ', req.body);

			options.eventName = req.body.eventName;
			options.directorName = req.body.directorName;
			options.comments = req.body.comments ? req.body.comments : req.body.comments;
			options.rankings = req.body.rankings ? 't' : 'f';
			options.fullResults = req.body.matrix ? 't' : 'f';
			options.handDiagrams = req.body.hands ? 't' : 'f';
			options.personalScore = req.body.scorecards ? 't' : 'f';

			console.log('new options: ', options);
		}
		const queryString = await handActionsService.buildQueryString(options);
		console.log('query string: ', queryString);

		// const payload = await handActionsService.buildPayload(options);
		const response = await sendToRemote.getFile(queryString, options);
		console.log('response from getFile: ', response);

		if (TYPE === 'movement') {
			res.setHeader('Content-Type', 'application/pdf');
			res.send(response);
		}
		if (TYPE === 'HTMLNEW') {
			if (options.fileType === 'html') {
				res.setHeader('Content-Type', 'text/html');
				res.send(response);
			}
			if (options.fileType === 'pdf') {
				res.setHeader('Content-Type', 'application/pdf');
				res.send(response);
			}
		}
	} catch (error) {
		next(error);
	}
}

async function handleDeleteHand(req, res, next) {
	try {
		// console.log('request object: ', req);

		console.log('request query object: ', req.query);

		if (Object.keys(req.query) < 1) {
			console.error('No query in request');
			const error = buildClientError(
				'Bad request: No gameCode parameter in request',
				400
			);
			return res.status(error.status).json(error);
		}
		const { gameCode } = req.query;
		const response = await sendToRemote.deleteRequest(gameCode);
		console.log(response);
		const result = await remoteResponse.getResponseAndError(response);
		console.log('result from XML: ', result);
		let success = {};
		let error = '';
		if (result.sfAttribute === 's') {
			success.success = true;
		} else {
			success.success = false;
			success.error = result.errAttribute;
		}
		res.status(200).json(success);
	} catch (error) {
		next(error);
	}
}

async function handleDownload(req, res, next) {
	try {
		console.log('handle download invoked');

		const { gameCode } = req.query;
		console.log(gameCode);

		if (!gameCode) {
			const error = buildClientError('No GameCode in query', 400);
			return res.status(error.status).json(error);
		}
		const response = await sendToRemote.downloadCurrent(gameCode);
		// console.log('response from download: ', response);

		if (response) {
			res.send(response.data);
		}

		// SLOT=SLOT123&TYPE=HRPBN&NOWRAP=TRUE
		res.status(200).json();
	} catch (error) {
		next(error);
	}
}

async function handleUpload(req, res, next) {
	try {
		const { gameCode } = req.query;

		console.log('req.files in handleUpload.controller', req.files);
		let queryString = '';
		let success = {};
		let error = '';
		if (req.files.length > 1) {
			// invoke lin upload
		} else {
			const files = req.files;
			const response = await sendToRemote.uploadCurrentSingle(gameCode, files);
			console.log('response before processing: ', response);

			const result = await remoteResponse.getResponseAndError(response);
			console.log('result from victor: ', result);

			if (result.sfAttribute === 's') {
				success.success = true;
			} else {
				success.success = false;
				success.error = result.errAttribute;
			}
		}
		res.status(200).json(success);
		// if(){}
	} catch (error) {
		next(error);
	}
}
module.exports = { handleHtmlPdf, handleDeleteHand, handleDownload, handleUpload };
