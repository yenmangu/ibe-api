const xmlController = require('../controllers/xml_controllers/xml_controller');
const sendToRemote = require('../services/remote/send_to_remote');
const parseResponse = require('../services/remote/remote_response');
const { parse } = require('path');

async function processObject(req, res) {
	try {
		let success = {};
		if (!req.body) {
			const clientError = new Error('No body in request');
			clientError.status = 400;
			throw clientError;
		}
		console.log(JSON.stringify(req.body, null, 2));
		const data = req.body;

		console.log('req.body: ', data);

		const xml = await xmlController.processPlayerDatabase(data);
		console.log('xml to send to victor', xml)
		const response = await sendToRemote.writeDatabase(xml);

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
		throw error;
	}
}
module.exports = { processObject };
