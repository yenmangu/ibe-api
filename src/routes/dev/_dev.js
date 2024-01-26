const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const router = express.Router();
const fs = require('fs');
const xmlController = require('../../controllers/xml_controllers/xml_controller');
const xmlService = require('../../services/xml_processing/xml_service');

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

router.get('/dev', (req, res) => {
	res.status(200).send('Dev Route Success');
});

router.get('/dummy_xml', async (req, res) => {
	try {
		const { filename } = req.query;

		if (!filename) {
			return res.status(400).send('Missing filename');
		}

		const compressedData = await xmlController.readXmlFileControllerDev(filename);

		// const compressedData = await xmlController.readXmlFileControllerDev(filename);
		if (compressedData) {
			console.log(compressedData.length.toString());
			// console.log(compressedData);
			// return
			res.setHeader('Content-Type', 'application/json');
			res.setHeader('Content-Encoding', 'gzip');
			res.setHeader('Content-Length', compressedData.length.toString());
			res.status(200).end(compressedData);
			// res.status(200).send({ compressedData });
			// res.status(200).send('wow')
		} else {
			throw new Error('File Not found or Processed');
		}
	} catch (err) {
		console.error(err);
		return res.status(500).send('Internal Server Error');
	}
});

module.exports = router;
