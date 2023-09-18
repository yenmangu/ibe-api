const { google } = require('googleapis');
const dotenv = require('dotenv').config();
const createAuthClient = require('./service_account_auth_controller');
const SPREADSHEET_ID = '1l9PQUVd66IQlkr24sjuJjvFeX14acbc7S_k6dpIPFXo';
const tabName = 'webhook_test';

async function addData(req, res, next) {
	try {
		let data;
		if (!req.body) {
			return res.status(404).send('No data');
		} else {
			data = { ...req.body };
		}

		const authClient = await createAuthClient();
		const sheets = google.sheets({ version: 'v4', auth: authClient });

		const response = await sheets.spreadsheets.values.get({
			spreadsheetId: SPREADSHEET_ID,
			range: `${tabName}`
		});

		const firstEmptyRow = response.data.values
			? response.data.values.length + 1
			: 0;
		console.log('Last Row: ', firstEmptyRow);
		const cellAddress = `${tabName}!A${firstEmptyRow}`;
		try {
			sheets.spreadsheets.values.update({
				spreadsheetId: SPREADSHEET_ID,
				range: cellAddress,
				valueInputOption: 'USER_ENTERED',
				resource: {
					values: [Object.values(data.entry)]
				}
			});
		} catch (err) {
			console.error(err);
			return res.status(500).send('Error Inserting Data');
		}
	} catch (err) {
		console.error(err);
		return res.status(500).send('Internal Server Error');
	}
}

module.exports = { addData };
