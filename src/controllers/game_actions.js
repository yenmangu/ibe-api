const gameActions = require('../services/xml_creation/game_actions_xml');
const gameActionsText = require('../services/game_actions_text');
const sendToRemote = require('../services/remote/send_to_remote');
const parseResponse = require('../services/remote/remote_response');
const sendFiles = require('../services/remote/send_files');
const xmlService = require('../services/xml_service');
const compressionService = require('../services/compression');

const manageFinalseXML = async (req, res) => {
	try {
	} catch (error) {
		throw error;
	}
};

const manageLockXML = async (req, res) => {
	try {
	} catch (error) {
		throw error;
	}
};

const manageGameActions = async (req, res, next) => {
	try {
		const path = req.path.split('/')[1];
		const data = req.body;
		console.log('req.body: ', data);

		const clientError = new Error();
		clientError.status = 400;
		clientError.message = 'Invalid path';
		let result;
		let success = { successVal: false };

		switch (path) {
			// FINALISE GAME

			case 'finalise':
				const text = await gameActionsText.writeActionsText(data, 'finalise');
				console.log('text: ', text);

				// result = true;
				if (result === null) {
					clientError.message = 'Invalid data for finalise';
					throw clientError;
				} else {
					const response = await sendToRemote.sendFinaliseRequest(text);
					console.log('finalise response: ', response.data);
					const remoteSuccess = await parseResponse.getResponseAndError(
						response.data
					);
					if (remoteSuccess.sfAttribute === 's') {
						success.successVal = true;
						success.message = '';
					} else {
						return res.status(500).json({ message: remoteSuccess.errAttribute });
					}
				}

				break;
			case 'lock':
				console.log('data: ', data);

				result = await gameActionsText.writeActionsText(data, 'lock');
				if (result === null) {
					clientError.message = 'Invalid data for lock';
					throw clientError;
				} else {
					const response = await sendToRemote.sendLockRequest(result);
					const splitResponse = response.data.split('\n');
					console.log('split response: ', splitResponse);

					if (splitResponse[0] === 'success') {
						success.successVal = true;
						success.message = splitResponse[1];
					} else {
						return res.status(500).json({ message: splitResponse });
					}
				}
				break;

			case 'redate':
				result = await gameActions.writeGameActions(data, 'redate');
				// result = { success: true };
				if (result === null) {
					clientError.message = 'Invalid data for redate';
					throw clientError;
				} else {
					const response = await sendToRemote.sendRedate(result);
					if (!response) {
						clientError.message = 'No response from remote server';
						throw clientError;
					}
					console.log('redate response', response.data);

					const remoteSuccess = await parseResponse.getResponseAndError(
						response.data
					);
					if (remoteSuccess.sfAttribute === 's') {
						success.successVal = true;
						success.message = '';
					} else {
						return res.status(500).json({ message: remoteSuccess.errAttribute });
					}
				}
				break;
			case 'merge':
				result = await gameActions.writeGameActions(data, 'merge');
				// dev testing routing
				// result = true
				if (result === null) {
					clientError.message = 'Invalid data for merging games';
					throw clientError;
				}
				const response = await sendToRemote.sendSimultaneous(result);

				if (!response) {
					clientError.message = 'No response from remote server';
					throw clientError;
				}
				console.log(response.data);

				const remoteSuccess = await parseResponse.getResponseAndError(
					response.data
				);
				if (remoteSuccess.sfAttribute === 's') {
					success.successVal = true;
					success.message = '';
				} else {
					return res.status(500).json({ message: remoteSuccess.errAttribute });
				}
				console.log('response: ', remoteSuccess);
				break;

			case 'purge':
				result = await gameActionsText.writeActionsText(data, 'purge');
				if (result === null) {
					clientError.message = 'Invalid data for purge';
					throw clientError;
				} else {
					const response = await sendToRemote.purgeRequest(result);
					console.log('response: ', response.data);
					if (response.data.split('\n')[0] === 'success') {
						success.successVal = true;
					}
				}
				break;
			default:
				throw clientError;
		}

		// console.log('result: ', result);
		const { successVal, message } = success;

		res.status(200).json({ message, successVal });
	} catch (error) {
		next(error);
	}
};

async function manageUploads(req, res, next) {
	try {
		let success;
		let files;
		if (req.files) {
			files = req.files;
		}
		if (req.file) {
			files = req.file;
		}
		const { gameCode, type } = req.query;
		console.log('params', req.query);
		console.log('request: ', req);

		const clientError = new Error();
		clientError.status = 400;
		if (!files) {
			clientError.message = 'No data in body';
			return res.status(400).json(clientError);
		}
		const data = {
			gameCode: gameCode,
			files: files
		};

		// const data = {
		// 	gameCode: gameCode,
		// 	files: files
		// };

		console.log('data is now: ', data);

		let result = {};

		if (type === 'BBO') {
			const response = await sendFiles.uploadBBO(data);
			// return;
			if (response) {
				const remoteSuccess = await parseResponse.getResponseAndError(response);
				console.log('remote success: ', remoteSuccess);

				if (remoteSuccess.sfAttribute === 's') {
					console.log('sf attribute  = s');
					result.success = true;
					result.message = 'success';
					console.log(result);
				} else {
					result.success = false;
					result.message = remoteSuccess.errAttribute;
				}
				console.log('result.success: ', result.success);
			}
			// const jsonFromResponse = await xmlService.convertResponse(response);
			// const compressedJson = await compressionService(jsonFromResponse);
		}
		if (type === 'USEBIO') {
			console.log('in usebio path');

			const response = await sendFiles.uploadUSEBIO(data);
			if (!response) {
				return res.status(500).json({ message: 'Internal Server Error' });
			}
			if (response) {
				const remoteSuccess = await parseResponse.getResponseAndError(response);
				console.log('remote success: ', remoteSuccess);
				if (remoteSuccess.sfAttribute === 's') {
					console.log('sf attribute  = s');
					result.success = true;
					result.message = 'success';
					console.log(result);
				} else {
					result.success = false;
					result.message = remoteSuccess.errAttribute;
				}
				console.log('result.success: ', result.success);
			}
		}
		// const { success, message } = result;
		res.status(200).json({ result });
	} catch (error) {
		next(error);
	}
}

module.exports = {
	manageFinalseXML,
	manageLockXML,
	manageGameActions,
	manageUploads
};
