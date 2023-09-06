const { google } = require('googleapis');
const dotenv = require('dotenv');
// const mapPropertyNamesToColumnNames = require('../../util/columnsMapping');
const dataMapping = require('../../util/columnsMapping');
const createAuthClient = require('./serviceAccountAuthController');
// const authorize = require('./googleAuthController');
const SPREADSHEET_ID = '1TKIhZDkGbAvH6WESjyCXiEpBUM4BUUXXOvvej77PzrU';
const tabName = 'Ibe Sign Ups';
const testTab = 'sign-ups-test';
const keys = [
	'firstName',
	'lastName',
	'type',
	'email',
	'internationalTelNumber',
	'directorKey',
	'gameCode',
	'country',
	'city',
	'usage',
	'howHeard',
	'feedback',
	'comments'
];

// Google sheet column mapping
// prettier-ignore
const columnMap = {
	'First Name': 'A',
	'Last Name': 'B',
	'Subscription Type': 'C',
	'Email': 'D',
	'Telephone Number': 'E',
	'Director Key': 'F',
	'Game Code': 'G',
	'Country': 'H',
	'City': 'I',
	'Usage': 'J',
	'How did they hear': 'K',
	'Feedback Choice': 'L',
	'Any comments': 'M',
	'Time Stamp': 'N'
};

// function getColumnLetter(key) {
// 	if (columnMap.hasOwnProperty(key)) {
// 		console.log('columnMap [Key]: ', columnMap[key], 'key: ', key);
// 		return columnMap[key];
// 	} else {
// 		return '';
// 	}
// }

// Add new sign up to google sheet

async function addNewSignUp(req, res, next) {
	// console.log('addNewsignUp data: ',data);
	try {
		let data;
		if (!req.body) {
			return res
				.status(400)
				.json({ message: 'Bad request, request body missing.' });
		} else {
			data = { ...req.body };
			data.time = new Date().toLocaleString();
			const tel = `'${data.internationalTelNumber}`;

			data.internationalTelNumber = tel;
		}

		let mappedData;
		let dataArray;
		if (data) {
			mappedData = dataMapping.mapDataWithMapping(data);
			// console.log('Mapped data: ', JSON.stringify(mappedData, null, 2));
			dataArray = dataMapping.mapToArray(mappedData);
		} else {
			throw Error('no data');
		}

		// console.log('dataArray: ', JSON.stringify(dataArray, null, 1));

		const authClient = await createAuthClient();

		const sheets = google.sheets({ version: 'v4', auth: authClient });
		const response = await sheets.spreadsheets.values.get({
			spreadsheetId: SPREADSHEET_ID,
			range: `${tabName}!A:N`
		});

		const firstEmptyRow = response.data.values
			? response.data.values.length + 1
			: 0;
		console.log('Last row: ', firstEmptyRow);

		dataArray.forEach(async entry => {
			const colKey = Object.keys(columnMap).find(key =>
				Object.keys(entry).includes(key)
			);
			const column = columnMap[colKey] || '';
			// console.log('column is :', column);
			// console.log('data entered is: ', Object.values(entry));
			// return;
			const cellAddress = `${tabName}!${column}${firstEmptyRow}:${column}${firstEmptyRow}`;
			// console.log('cellAddress: ', cellAddress);

			try {
				await sheets.spreadsheets.values.update({
					spreadsheetId: SPREADSHEET_ID,
					range: cellAddress,
					valueInputOption: 'USER_ENTERED',

					resource: {
						values: [Object.values(entry)]
					}
				});
			} catch (err) {
				console.error('Error inserting data: ', err);
				return res.status(500).json({ message: 'Error Inserting Data', err });
			}
		});

		// return res.status(200).json({ message: 'Row Added Successfully', data: data });
	} catch (err) {
		console.error('Error: ', err);
		// throw new Error('ERR_UPDATING', err);
		return res.status(500).json({ message: 'Interal Server Error', err });
	}
}

// Initialise the New Sheet

async function createSheetWithHeaders() {
	try {
		console.log('id is :', id);

		const newKeys = dataMapping.mapPropertyNamesToColumnNames(keys);
		console.log(keys);
		const authClient = await createAuthClient();
		const service = google.sheets({ version: 'v4', auth: authClient });

		const result = await service.spreadsheets.values.update({
			SPREADSHEET_ID,
			range: 'sign-ups-test!A1',
			valueInputOption: 'RAW',
			resource: {
				values: [newKeys]
			}
		});
		console.log('updated sheet', result);
	} catch (err) {
		console.error('Error updating sheet', err);
	}
}

module.exports = {
	createSheetWithHeaders,
	addNewSignUp
};
