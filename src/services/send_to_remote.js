const axios = require('axios');
const serverResponse = require('./remote_response');

async function uploadCurrentConfig(data) {
	try {
		if (!data) {
			const serverError = new Error(
				'Internal Server Error. No data in uploadCurrentConfig'
			);
			serverError.status = 500;
			throw serverError;
		}

		const headers = { 'Content-Type': 'text/plain' };
		const response = await axios.post(process.env.CURRENT_GAME, data, {
			headers: headers
		});
		// console.log('Remote response: ', response);
		return response;
	} catch (error) {
		throw error;
	}
}

async function uploadCurrentSettings(data) {
	try {
		if (!data) {
			const serverError = new Error(
				'Internal Server Error. No data in uploadCurrentConfig'
			);
			serverError.status = 500;
			throw serverError;
		}
		
		const headers = { 'Content-Type': 'text/plain' };
		const response = await axios.post(process.env.SETTINGS, data, {
			headers: headers
		});
		// console.log('Remote response: ', response);
		return response;
	} catch (error) {
		throw error;
	}
}
module.exports = { uploadCurrentConfig, uploadCurrentSettings };
