const linSheetsController = require('./google_controllers/lin_sheets_controller');
const { convertURL } = require('../services/url_string_extraction');

const timeout = 10000;

const modifiedDataTab = 'new_lin';
const bulkConvertTest = 'BULK_convert_test';

async function handlePaymaticWebhook(req, res) {
	if (!req.body) {
		console.log('Bad Request: Body not found');
		return res.status(400).send('Bad Request');
	}

	const payload = req.body;

	// DEV

	// console.log('PAYLOAD: ', payload);

	const key = payload.customer_name_1;
	const decodedkey = key.replace(/(%20)?/g, '');
	console.log('Payload URL: ', key);
	console.log('Payload URL decoded: ', decodedkey);

	setTimeout(async () => {
		console.log(`${timeout}ms passed, executing`);
		try {
			const submissionID = await linSheetsController.getId(decodedkey);
			// if (!submissionID) {
			// 	console.error(`\nNo key: ${key} found`);
			// 	throw Error;
			// }
			const useableString = convertURL(decodedkey);

			// const newDataArray = [`${submissionID},${useableString}`];
			let newDataArray = [];
			newDataArray.push([submissionID, useableString, decodedkey]);

			// console.log('newDataArray: ', newDataArray);

			const response = await linSheetsController.addData(
				newDataArray,
				modifiedDataTab
			);
			if (response) {
				res.status(200).send('Success adding to google sheet');
			}
		} catch (err) {
			console.error('Internal Server Error', err);
			return res.status(500).send('Internal Server Error');
		}
	}, timeout);
}

async function handleBulkConvert(req, res, next) {
	try {
		// console.log('Request: ', req);

		// if (Object.keys(req.query).length < 1) {
		// 	return res
		// 		.status(400)
		// 		.json({ message: 'Bad request: missing query parameters' });
		// }
		const processedData = await linSheetsController.bulkProcess();
		const batchResponse = await linSheetsController.addBulkData(processedData);
		let errorArray = [];

		res.status(200).json({ processedData });
		return;

		res
			.status(200)
			.json({ message: 'Success from handle bulk convert controller' });
	} catch (error) {
		next(error);
	}
}

module.exports = { handlePaymaticWebhook, handleBulkConvert };
