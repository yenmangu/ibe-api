const axios = require('axios');
const serverResponse = require('./remote_response');
const { query } = require('express');
const FormData = require('form-data');

function getFormDataHeaders(formData) {
	return { 'Content-Type': `multipart/form-data; boundary=${formData._boundary}` };
}

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

async function getFile(queryString, options) {
	try {
		console.log('in sendToRemote: ', options.TYPE);

		console.log('options in send to remote.getFile: ', options);

		let formData = new FormData();
		let payload = '';

		if (options.TYPE === 'movement') {
			formData.append('postdatapassedbyform', options.inputTitle);
		} else if (options.TYPE === 'HTMLNEW') {
			// formData.append(
			// 	'postdatapassedbyform',
			// 	`${options.eventName}\n${options.directorName}\n${
			// 		options.comments ? options.comments : ''
			// 	}`
			// );
			payload = `${options.eventName}\n${options.directorName}\n${
				options.comments ? options.comments : ''
			}`;
		}
		// Common Headers and Config
		let headers = { 'Content-Type': 'multipart/formdata' };

		let config = {
			method: 'post',
			maxBodyLength: Infinity,
			url: `${process.env.GET_FILE}?${queryString}`,
			headers: headers,
			data: formData
		};
		if (options.TYPE === 'movement') {
			config.responseType = 'arraybuffer';
			const response = await axios.request(config);
			return response.data;
		}
		if (options.TYPE === 'HTMLNEW') {
			config.data = payload;
			config.headers = { 'Content-Type': 'text/plain' };

			if (options.fileType === 'pdf') {
				config.responseType = 'arraybuffer';
			}

			if (options.fileType === 'html') {
			}

			const response = await axios.request(config);
			return response.data;
		}
		// console.log('queryString before sending: ', queryString);
		// const response = await axios.request(config);
		// console.log('direct response from victor: ', response);
	} catch (error) {
		console.error('error sending axios: ', error);
	}
}

async function deleteRequest(gameCode) {
	try {
		const queryString = `SLOT=${gameCode}`;
		const response = await axios.post(`${process.env.DELETE_HAND}?${queryString}`);
		if (response) {
			console.log(response.data);

			return response.data;
		}
	} catch (error) {
		throw error;
	}
}

async function downloadCurrent(gameCode) {
	try {
		const queryString = `SLOT=${gameCode}&TYPE=HRPBN&NOWRAP=TRUE`;
		console.log('query string: ', queryString);

		const config = {
			method: 'get',
			url: `${process.env.GET_FILE}?${queryString}`
			// responseType: 'arraybuffer'
		};

		const response = await axios.request(config);
		// console.log('response: ', response);

		return response;
	} catch (error) {
		throw error;
	}
}

async function uploadCurrentSingle(gameCode, files) {
	try {
		console.log('files in send to remote: ', files);

		const formData = new FormData();
		formData.append('diasel', '1');
		files.forEach(file => {
			formData.append('upload', file.buffer);
		});
		console.log('payload: ', formData);

		const config = {
			method: 'post',
			url: `${process.env.PUT_HAND_RECORD}?SLOT=${gameCode}`,
			headers: { 'Content-Type': 'multipart/form-data' },
			// headers: formData.getHeaders(),
			data: formData,
			maxContentLength: Infinity
		};
		const response = await axios.request(config);
		if (response) {
			console.log('\n *************** \n axios response: \n', response.data);

			return response.data;
		}
	} catch (error) {
		throw error;
	}
}

async function restoreGame(payload) {
	try {
		const config = {
			method: 'post',
			url: `${process.env.RAISE_DEAD}`,
			data: payload
		};

		const response = await axios.request(config);

		return response.data;
	} catch (error) {
		throw error;
	}
}

async function getEBU(queryString, formDataString) {
	const formData = new FormData();
	formData.append('postdatapassedbyform', formDataString);
	const headers = { 'Content-Type': 'multipart/form-data' };
	try {
		const config = {
			method: 'post',
			url: `${process.env.GET_FILE}?${queryString}`,
			maxContentLength: Infinity,
			headers: {
				...formData.getHeaders(),
				data: formData
			}
		};
		// console.log('URL: ', config.url);

		const serverResponse = await axios.request(config);

		return serverResponse.data;
	} catch (error) {
		throw error;
	}
}

async function getBridgeWebs(payload) {
	try {
		const payloadString = `SLOT=${payload.gameCode}&TYPE=BRIDGEWEBS&NOWRAP=TRUE`;

		const config = {
			method: 'post',
			url: `${process.env.GET_FILE}?${payloadString}`
		};

		const serverResponse = await axios.request(config);

		return serverResponse.data;
	} catch (error) {
		throw error;
	}
}

async function dbFromBW(data) {
	try {
		const formData = new FormData();
		formData.append('diasel', '1');
		formData.append('diacc', `${data.payload.accountName}`);
		formData.append('diapass', `${data.payload.accountPass}`);
		if (data.payload.contactInfo) {
			formData.append('diaupfrombwincpdcb', 'on');
		}
		if (data.payload.excludePlayers) {
			formData.append('diaupfrombwdelcb', 'on');
		}
		formData.append('upload', data.payload.fileContent, '');

		const config = {
			method: 'post',
			url: `${process.env.FROM_BW}?SLOT=${data.gameCode}`,
			data: formData,
			maxContentLength: Infinity,
			headers: {
				'Content-Type': `multipart/form-data; boundary=${formData._boundary}`
			}
		};

		const serverResponse = await axios.request(config);
		return serverResponse.data;
	} catch (error) {
		throw error;
	}
}

async function sendPlayerDb(payload) {
	try {
		// console.log('Send Player db payload: ', payload);

		const { readStream } = payload;

		const formData = new FormData();
		formData.append('diasel', '4');
		formData.append('diacc', '');
		formData.append('diapass', '');
		formData.append('upload', readStream);

		const config = {
			method: 'post',
			url: `${process.env.IMPORT_DB}?SLOT=${payload.gameCode}`,
			data: formData,
			maxContentLength: Infinity,
			headers: getFormDataHeaders(formData),
			timeout: 20000
		};

		console.log('about to send to remote');

		const response = await axios.request(config);
		console.log('awaiting response from server');
		return response.data;
	} catch (error) {
		console.error('Error sending data: ', error);
		console.error('Error stack: ', error.stack);
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
	writeDatabase,
	getFile,
	deleteRequest,
	downloadCurrent,
	uploadCurrentSingle,
	restoreGame,
	getEBU,
	getBridgeWebs,
	dbFromBW,
	sendPlayerDb
};
