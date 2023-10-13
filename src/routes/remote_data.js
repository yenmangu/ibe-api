const express = require('express');
const fs = require('fs');
const { getCurrentData } = require('../services/get_current');
const router = express.Router();
const {
	processJSON,
	processXML
} = require('../controllers/xml_controllers/xml_controller');
const xml_service = require('../services/xml_service');

router.use(function timeLog(re, res, next) {
	console.log('Time: ', Date());
	next();
});

router.get('/', async (req, res) => {
	try {
		const { game_code, dir_key } = req.query;

		if (!game_code || !dir_key) {
			return res.status(400).json({ message: 'No parameters for account' });
		}
		const authData = {
			game_code,
			dir_key
		};

		const remoteResponse = await getCurrentData(authData);
		if (!remoteResponse) {
			return res.status(404).json({ message: 'Match Data not found' });
		}
		const trimmedResponse = remoteResponse.data.trim();
		// res.send(trimmedResponse)
		const compressedData = await processXML(remoteResponse.data);

		const sfValue = await xml_service.parseSfAttribute(trimmedResponse);
		let remoteResult;
		if (compressedData) {
			if (sfValue === 's') {
				remoteResult = 'SUCCESS';
				console.log(compressedData.length.toString());
				res.setHeader('Content-Type', 'application/json');
				res.setHeader('Content-Encoding', 'gzip');
				res.setHeader('Content-Length', compressedData.length.toString());
				res.status(200).end(compressedData);
			}
		} else if (sfValue === 'f') {
			remoteResult = 'FAIL';
			return res
				.status(400)
				.json({ message: 'Error retrieving remote data', remoteResponse });
		} else {
			remoteResult = 'ERROR';
			return res
				.status(400)
				.json({ message: 'Error retrieving remote data', remoteResponse });
		}
	} catch (err) {
		console.error('error in retrieving from remote: ', err);
		return res.status(500).json({ message: 'Internal Server Error', err });
	}
});
// res.status(200).json({ remoteResult, compressedData });

router.post('/', async (req, res) => {
	try {
		const data = req.body;
		if (data) {
			console.log('received-data: ', data);
			const response = await processJSON(data);
			
			console.log(response);
			// console.log('data in api: ', data);
			res.status(200).json({ message: 'Data Receieved by API' });
		}
	} catch (err) {
		console.error('error posting to remote');
		return res.status(500).json({ message: 'Internal Server Error', error: err });
	}
});

module.exports = router;
