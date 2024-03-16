const handActionsService = require('../../services/hand_actions_service');
const sendToRemote = require('../../services/remote/send_to_remote');
const remoteResponse = require('../../services/remote/remote_response');
const XmlFileService = require('../../services/xml_creation/xml_file_creation');
const CsvFileService = require('../../services/file_creation/csv_file_creation');
const fs = require('fs');

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

async function handleEBU(req, res, next) {
	try {
		const body = req.body;
		console.log('Body: ', JSON.stringify(body));

		const { type, gameCode, formData } = req.body;
		if (!gameCode) {
			const clientError = buildClientError('No game code in request', 401);
			return res.status(clientError.status).json(clientError.message);
		}
		if (!formData) {
			const clienError = buildClientError('No form data in request', 400);
			return res.status(clientError.status).json(clientError.message);
		}
		const options = {
			type,
			gameCode
		};

		let response = {};

		const queryString = await handActionsService.buildQueryString(options);
		if (!queryString) {
			throw new Error('Failed to build query string');
		}

		const formDataString = await handActionsService.buildEbuElement(formData);

		// return;

		const serverResponse = await sendToRemote.getEBU(queryString, formDataString);

		console.log('server response: ', serverResponse);

		if (serverResponse.split('\n')[0].trim() !== 'failure') {
			const xmlData = serverResponse;
			const filePath = await XmlFileService.saveXmlToFile(xmlData);

			res.setHeader('Content-Disposition', 'attachment; filename=response.xml');
			res.setHeader('Content-Type', 'application/xml');
			const fileStream = await fs.createReadStream(filePath);
			fileStream.pipe(res);

			fileStream.on('close', () => {
				fs.unlink(filePath, err => {
					if (err) {
						throw new Error('Error deleting file');
					} else {
						console.log('file deleted successfully');
					}
				});
			});
		} else {
			throw new Error(
				`Error from remote server: ${serverResponse.split('\n')[1].trim()}`
			);
		}

		// res.status(200).json({ message: 'success from API', response });
	} catch (error) {
		next(error);
	}
}

async function handleBridgewebsDownload(req, res, next) {
	try {
		console.log('req: ', req.body);
		const { gameCode } = req.body;
		if (!gameCode) {
			const clientError = buildClientError('No Gamecode provided', 400);
			return res.status(clientError.status).json(clientError.message);
		}
		const payload = { gameCode };
		const serverResponse = await sendToRemote.getBridgeWebs(payload);
		if (serverResponse.split('\n')[0].trim() !== 'failure') {
			const data = serverResponse;
			const filePath = await CsvFileService.saveCsvToFile(data);

			res.setHeader('Content-Disposition', 'attachment; filename=response.csv');
			res.setHeader('Content-Type', 'text/csv');

			const fileStream = await fs.createReadStream(filePath);
			fileStream.pipe(res);

			fileStream.on('close', () => {
				fs.unlink(filePath, err => {
					if (err) {
						throw new Error('Error deleting file');
					} else {
						console.log('Temporary CSV response file deleted successfully');
					}
				});
			});
		}
	} catch (error) {
		next(error);
	}
}
module.exports = {
	handleHtmlPdf,
	handleDeleteHand,
	handleDownload,
	handleUpload,
	handleEBU,
	handleBridgewebsDownload,
	buildClientError
};
