const linSheetsController = require('../controllers/google_controllers/lin_sheets_controller');
const { convertURL } = require('../services/url_string_extraction');
const timeOut = 5000;

// async function processBBOForm(data) {
// 	try {
// 		const key = data.customer_name_1;
// 		// const submissionID = await new Promise((resolve, reject) => {
// 		try {
// 			const id = await linSheetsController.getId(key);
// 		} catch (err) {
// 			console.error('Error fetching submission ID: ', err);
// 			reject(err);
// 		}
// 		// });
// 		console.log(key);
// 		console.log(submissionID);
// 		// Convert URL into usable format
// 		const useableString = convertURL(key);
// 		// Build data array
// 		const newDataAray = [`${submissionID},${useableString}`];
// 		console.log(newDataAray);

// 		return newDataAray;
// 	} catch (err) {
// 		console.error('Internal Server Error', err);
// 		return { status: 500, message: 'Internal Server Error' };
// 	}
// }




async function retrieveID(key) {
	try {
		const submissionID = await new Promise(async (resolve, reject) => {
			try {
				const id = await linSheetsController.getId(key);
				resolve(id);
			} catch (err) {
				console.error('Error fetching submission ID: ', err);
				reject(err);
			}
		});

	} catch (err) {
		console.error('Internal Server Error', err);
		return { status: 500, message: 'Internal Server Error' };
	}
}



module.exports = { retrieveID };
