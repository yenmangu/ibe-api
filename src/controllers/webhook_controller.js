const linSheetsController = require('./google_controllers/lin_sheets_controller');
const { convertURL } = require('../services/url_string_extraction');

const timeout = 10000;

async function handlePaymaticWebhook(req, res) {
	if (!req.body) {
		console.log('Bad Request: Body not found');
		return res.status(400).send('Bad Request');
	}

	const payload = req.body;

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

			const response = await linSheetsController.addData(newDataArray);
			if (response) {
				res.status(200).send('Success adding to google sheet');
			}
		} catch (err) {
			console.error('Internal Server Error', err);
			return res.status(500).send('Internal Server Error');
		}
	}, timeout);
}

module.exports = { handlePaymaticWebhook };
