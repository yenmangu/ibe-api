const xmlController = require('../controllers/xml_controllers/xml_controller');
const sendToRemote = require('../services/remote/send_to_remote');
const parseResponse = require('../services/remote/remote_response');
const { parse } = require('path');
const { buildCustomError, CustomError } = require('../services/error/error');
const { getCurrentData } = require('../services/get_current');
const fsp = require('fs').promises;
const fs = require('fs');
const XmlFileService = require('../services/file_creation/xml_file_creation');
const bwFormDataService = require('../services/bridge_webs_form');

async function processObject(req, res) {
	try {
		let success = {};
		if (!req.body) {
			const clientError = new CustomError('No body in request');
			clientError.status = 400;
			throw clientError;
		}
		console.log(JSON.stringify(req.body, null, 2));
		const data = req.body;

		// console.log('req.body: ', data);

		const xml = await xmlController.processPlayerDatabase(data);
		console.log('xml to send to victor', xml);
		// const response = await sendToRemote.writeDatabase(xml);

		let response;
		try {
			response = await sendToRemote.writeDatabase(xml);
		} catch (error) {
			console.error('Error in sendToRemote.WriteDatabase', error);
			return res
				.status(500)
				.json({ message: 'Failed to wriote to remote database' });
		}

		if (!response || !response.data) {
			console.error('Invalid response from sendToRemote.WriteDatabase');
			return res
				.status(500)
				.json({ message: 'Invalid response from remote database' });
		}

		const remoteSuccess = await parseResponse.getResponseAndError(response.data);
		if (remoteSuccess.sfAttribute === 's') {
			success.successVal = true;
			success.message = '';
		} else {
			return res.status(500).json({ message: remoteSuccess.errAttribute });
		}
		const { successVal, message } = success;

		res.status(200).json({ message, successVal });
		// res.send(req.body);
	} catch (error) {
		throw CustomError;
	}
}

async function coordinateDatabaseOps(req, res, next) {
	try {
		if (!req.body) {
			const clientError = buildCustomError('No body in request', 400);
			return res.status(clientError.status).json(clientError.message);
		}
		const { gameCode, dirKey } = req.body;
		if (!gameCode) {
			const clientError = buildCustomError('No Game Code in request', 401);
			return res.status(clientError.status).json(clientError.message);
		}
		if (!dirKey) {
			const clientError = buildCustomError('No Director Key in request', 401);
			return res.status(clientError.status).json(clientError.message);
		}
		const response = await getCurrentData({ game_code: gameCode, dir_key: dirKey });
		const xml = response.data;

		const playerDb = await xmlController.coordinateDataExtraction(xml, 'playerdb');

		const tempFilePath = await XmlFileService.saveXmlToFile(playerDb);

		const fileContent = await fsp.readFile(tempFilePath);

		console.log('file content: ', fileContent);

		await fsp.unlink(tempFilePath);
		const currentDate = new Date();
		const day = String(currentDate.getDate()).padStart(2, '0');
		const month = String(currentDate.getMonth() + 1).padStart(2, '0');
		const year = String(currentDate.getFullYear());

		const ukFormatDate = `${day}${month}${year}`;

		const filename = `${gameCode}_${ukFormatDate}_db.xml`;

		res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
		res.setHeader('Content-Type', 'application/xml');
		res.setHeader('X-Filename', filename);
		res.end(fileContent);
	} catch (error) {
		next(error);
	}
}

// From BridgeWebs to DB

async function coordinateBwFromOps(req, res, next) {
	try {
		if (!req.body) {
			const clientError = buildCustomError('No body in request', 400);
			return res.status(clientError.status).json(clientError.message);
		}
		const { gameCode, dirKey, formData } = req.body;
		if (!gameCode) {
			const clientError = buildCustomError('No Game Code in request', 401);
			return res.status(clientError.status).json(clientError.message);
		}
		if (!dirKey) {
			const clientError = buildCustomError('No Director Key in request', 401);
			return res.status(clientError.status).json(clientError.message);
		}
		if (!formData) {
			const clientError = buildCustomError('No form data in request', 400);
			return res.status(clientError.status).json(clientError.message);
		}

		console.log('Req body: ', req.body);

		const bridgeWebsFormdata = bwFormDataService.createBridgeWebsFormdata(formData);

		console.log('BW Form Data: ', bridgeWebsFormdata);

		const data = { gameCode, dirKey, formData: bridgeWebsFormdata };

		console.log('data: ', data);

		const bwResponse = await sendToRemote.dbFromBW(data);

		// console.log('BW RESPONSE: ', bwResponse);

		let apiResponse = {};

		const remoteSuccess = await parseResponse.getResponseAndError(bwResponse);
		if (remoteSuccess.sfAttribute === 's') {
			apiResponse.message = 'success';
			apiResponse.success = true;
		}
		if (remoteSuccess.sfAttribute === 'f') {
			apiResponse.message = 'fail';
			apiResponse.success = false;
			apiResponse.clientError = remoteSuccess.errAttribute;
		}

		res.status(200).json(apiResponse);
	} catch (error) {
		next(error);
	}
}

async function handleDatabaseImport(req, res, next) {
	try {
		if (!Object.keys(req.body).length) {
			const clientError = buildCustomError('No body in request', 400);
			return res.status(clientError.status).json(clientError.message);
		}
		const { gameCode, dirKey, importData, meta } = req.body;
		if (!gameCode || !dirKey || !importData || !meta) {
			if (!importData) {
				const clientError = buildCustomError('No import data', 400);
				return res.status(clientError.status).json(clientError.message);
			}
			if (!meta) {
				const clientError = buildCustomError('No import meta data', 400);
				return res.status(clientError.status).json(clientError.message);
			} else {
				const clientError = buildCustomError('No credentials in request', 401);
				return res.status(clientError.status).json(clientError.message);
			}
		}

		console.log(
			'Validation Passed. moving onto xmlController.importEntireDatabase'
		);
		let serverResponse;
		try {
			serverResponse = await xmlController.importEntirePlayerDb({
				gameCode,
				dirKey,
				importData,
				meta
			});

			console.log('server response: ', serverResponse);
			if (serverResponse) {
				res.status(200).json({
					serverResponse
				});
			}
		} catch (error) {
			console.error('Error in server response', error);
			throw error;
		}
	} catch (error) {
		next(error);
	}
}

async function handleDeleteRequest(req, res, next) {
	try {
		console.log('Reached delete request');

		const { gameCode, dirKey } = req.query;
		if (!gameCode) {
			throw new CustomError('Error no gamecode in request');
		}
		// console.log(req);
		const serverResponse = await xmlController.coordinateDbDelete({ gameCode });

		res.status(200).json({ serverResponse });
	} catch (error) {
		console.error(error);
		next(error);
	}
}

module.exports = {
	processObject,
	coordinateDatabaseOps,
	coordinateBwFromOps,
	handleDatabaseImport,
	handleDeleteRequest
};
