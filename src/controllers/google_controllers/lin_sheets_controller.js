const { google } = require('googleapis');
const dotenv = require('dotenv').config();
const createAuthClient = require('./service_account_auth_controller');
const convertURL = require('../../services/url_string_extraction');

const SPREADSHEET_ID = '1l9PQUVd66IQlkr24sjuJjvFeX14acbc7S_k6dpIPFXo';
const tabName = 'webhook_test';
const lookupTab = 'BBO';
const modifiedDataTab = 'new_lin';

async function sheetsAuthClient() {
	const authClient = await createAuthClient();
	const sheets = google.sheets({ version: 'v4', auth: authClient });
	return sheets;
}

async function getId(key) {
	try {
		const authClient = await createAuthClient();
		const sheets = google.sheets({ version: 'v4', auth: authClient });

		const range = `${lookupTab}!A:L`;

		const response = await sheets.spreadsheets.values.get({
			spreadsheetId: SPREADSHEET_ID,
			range: range,
			auth: authClient
		});

		const values = response.data.values;
		const searchKey = key;
		let resultValue = null;

		for (const row of values) {
			if (row[1] === key) {
				resultValue = row[11];
				break;
			}
		}
		if (resultValue !== null) {
			console.log('Result: ', resultValue);
			return resultValue;
		} else {
			console.log(key, ': Not found in sheet');
			throw Error;
		}
	} catch (err) {
		console.error('Internal Server Error', err);
	}
}

async function addData(processedData) {
	try {
		// console.log('data to be added via addData()', processedData);
		const authClient = await createAuthClient();
		const sheets = google.sheets({ version: 'v4', auth: authClient });

		const response = await sheets.spreadsheets.values.get({
			spreadsheetId: SPREADSHEET_ID,
			range: `${modifiedDataTab}`
		});

		const firstEmptyRow = response.data.values
			? response.data.values.length + 1
			: 0;

		console.log('Last Row: ', firstEmptyRow);
		const cellAddress = `${modifiedDataTab}!A${firstEmptyRow}`;
		console.log('Cell Address: ', cellAddress);

		const updateResponse = await sheets.spreadsheets.values.update({
			spreadsheetId: SPREADSHEET_ID,
			range: cellAddress,
			valueInputOption: 'USER_ENTERED',
			resource: {
				values: processedData
			},
			auth: authClient
		});
		if (updateResponse.status === 200) {
			console.log('Data Added Successfully: ', processedData);
			return { status: 200, message: 'Data added successfully' };
		} else {
			console.error(`Google Sheets API Error: ${updateResponse.statusText}`);
			return { status: 500, message: 'Error adding data to Google Sheets' };
		}
	} catch (err) {
		console.error('Internal Server Error: ', err.message);
		return { status: 500, message: 'Internal server Error' };
	}
}

module.exports = { sheetsAuthClient, getId, addData };
