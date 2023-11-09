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
		console.log('Remote response: ', response.data);
		return response;
	} catch (error) {
		throw error;
	}
}

async function sendRedate(data) {
	try {
		const headers = { 'Content-Type': 'application/xml' };
		const response = await axios.post(process.env.REDATE, data, { headers });
		return response;
	} catch (error) {
		throw error``;
	}
}
async function sendLockRequest(data) {
	try {
		console.log('data in sendLock(): ', data);
		const headers = { 'Content-Type': 'text/plain' };
		const response = await axios.post(process.env.LOCK, data, { headers });
		return response;
	} catch (error) {
		throw error;
	}
}
async function sendFinaliseRequest(data) {
	try {
		const headers = { 'Content-Type': 'text/plain' };
		const response = await axios.post(process.env.FINALISE, data, { headers });
		return response;
	} catch (error) {
		throw error;
	}
}

async function sendSimultaneous(data) {
	try {
		const headers = { 'Content-Type': 'application/xml' };
		const response = await axios.post(process.env.MERGE, data, { headers });
		if (response) {
			return response;
		}
	} catch (error) {
		console.error('error sending simultaneous: ', error);
		throw error;
	}
}
async function purgeRequest(data) {
	try {
		const headers = { 'Content-Type': 'text/plain' };
		const response = await axios.post(process.env.PURGE, data, { headers });
		if (response) {
			return response;
		}
	} catch (error) {
		console.error('error sending simultaneous: ', error);
		throw error;
	}
}

async function writeDatabase(data) {
	try {
		const headers = { 'Content-Type': 'application/xml' };
		const response = await axios.post(process.env.WRITE_DB, data, { headers });
		if (response) {
			return response;
		}
	} catch (error) {
		throw error;
	}
}

module.exports = {
	uploadCurrentConfig,
	uploadCurrentSettings,
	sendRedate,
	sendLockRequest,
	sendFinaliseRequest,
	sendSimultaneous,
	purgeRequest,
	writeDatabase
};
