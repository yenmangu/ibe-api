const { google } = require('googleapis');
const dotenv = require('dotenv').config();
const createAuthClient = require('./service_account_auth_controller');
const { convertURL } = require('../../services/url_string_extraction');

const SPREADSHEET_ID = '1l9PQUVd66IQlkr24sjuJjvFeX14acbc7S_k6dpIPFXo';
const tabName = 'webhook_test';
const lookupTab = 'BBO';
const modifiedDataTab = 'new_lin';
const bulkToConvert = 'bulk_copy';
const bulkConvertTest = 'BULK_convert_test';

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

async function addData(processedData, tab) {
	try {
		// console.log('data to be added via addData()', processedData);
		const authClient = await createAuthClient();
		const sheets = google.sheets({ version: 'v4', auth: authClient });

		const response = await sheets.spreadsheets.values.get({
			spreadsheetId: SPREADSHEET_ID,
			range: tab
		});

		const firstEmptyRow = response.data.values
			? response.data.values.length + 1
			: 0;

		// console.log('Last Row: ', firstEmptyRow);
		const cellAddress = `${tab}!A${firstEmptyRow}`;
		// console.log('Cell Address: ', cellAddress);

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
			// console.log('Data Added Successfully: ', processedData);
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

async function bulkProcess() {
	try {
		const authClient = await createAuthClient();
		const sheets = google.sheets({ version: 'v4', auth: authClient });

		const responseValues = await sheets.spreadsheets.values.get({
			spreadsheetId: SPREADSHEET_ID,
			range: `${bulkToConvert}`,
			auth: authClient
		});
		const {
			data: { values: rows }
		} = responseValues;
		// const headerRow = values.shift();

		rows.shift();

		// console.log(rows[0][1]);

		// Proving the system works
		/*
		const oldRow = [...rows[0]];
		const convertedUrl = convertURL(rows[0][1]);
		rows[0][1] = convertedUrl;
		const toCompare = { old: oldRow, new: rows[0] };
		*/
		// End proof

		// console.log('Data values shifted: ', headerRow);

		// [x] Loop through the rows, convert each url (row[x][1]), and return such row
		// [x] Get ID of row to insert using the getId() function above
		// [x] Add ID into new row to be inserted
		// [x] Collate rows
		// [-] Test by inserting rows into test sheet (BULK_convert_test) first empty row
		// [] Insert rows into existing sheet (new_lin) first empty row
		//
		const toBeInserted = [];
		rows.forEach((row, i) => {
			const originalLink = [...row[1]];
			const extracted = convertURL(row[1]);
			let submissionID;
			if (row[11]) {
				submissionID = row[11];
			} else {
				// Default if no id present
				submissionID = 'undefined';
			}
			row[1] = extracted;
			console.log('submission ID: ', submissionID);
			const newRow = [submissionID, extracted, originalLink.join('')];
			toBeInserted.push(newRow);
		});

		return toBeInserted;
	} catch (error) {
		console.error('Error processing bulk data: ', error);
		return;
	}
}

async function addBulkData(toBeInserted) {
	try {
		const authClient = await createAuthClient();
		const sheets = google.sheets({ version: 'v4', auth: authClient });
		const firstEmptyResponse = await sheets.spreadsheets.values.get({
			spreadsheetId: SPREADSHEET_ID,
			range: `${bulkConvertTest}`
		});

		const firstEmptyRow = firstEmptyResponse.data.values
			? firstEmptyResponse.data.values.length + 1
			: 1;

		// batch insert rows
		// const response = await sheets.spreadsheets.values.....

		const batchData = toBeInserted.map((rowData, index) => ({
			range: `${bulkConvertTest}!A${firstEmptyRow + index}`,
			values: [rowData]
		}));

		const batchUpdateReq = {
			spreadsheetId: SPREADSHEET_ID,
			resource: {
				valueInputOption: 'USER_ENTERED',
				data: batchData
			}
		};

		const response = await sheets.spreadsheets.values.batchUpdate(batchUpdateReq);

		return response;

		console.log('Bulk data added: ', response.data);
	} catch (error) {
		console.error('Error adding bulk data', error);
	}
}

module.exports = { sheetsAuthClient, getId, addData, bulkProcess, addBulkData };
