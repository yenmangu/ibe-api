const axios = require('axios');

const writeDeleteRequest = require('../xml_creation/historic_games');
const serverResponse = require('./remote_response');
const FormData = require('form-data');
const { env } = process;
const { CustomError } = require('../error/Error');

const currentGame = env.CURRENT_GAME || '';
const settings = env.SETTINGS || '';
const redate = env.REDATE || '';
const lock = env.LOCK || '';
const finalise = env.FINALISE || '';
const merge = env.MERGE || '';
const purge = env.PURGE || '';
const writeDB = env.WRITE_DB || '';

function getFormDataHeaders(formData) {
	return { 'Content-Type': `multipart/form-data; boundary=${formData._boundary}` };
}

const formHeaders = { 'Content-Type': 'multipart/form-data' };
const textHeaders = { 'Content-Type': 'text/plain' };

async function uploadCurrentConfig(data) {
	try {
		if (!data) {
			const serverError = new Error(
				'Internal Server Error. No data in uploadCurrentConfig'
			);

			throw serverError;
		}

		const headers = { 'Content-Type': 'text/plain' };
		const response = await axios.post(currentGame, data, {
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
			throw serverError;
		}

		const headers = { 'Content-Type': 'text/plain' };
		const response = await axios.post(settings, data, {
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
		const response = await axios.post(redate, data, { headers });
		return response;
	} catch (error) {
		throw error``;
	}
}
async function sendLockRequest(data) {
	try {
		console.log('data in sendLock(): ', data);
		const headers = { 'Content-Type': 'text/plain' };
		const response = await axios.post(lock, data, { headers });
		return response;
	} catch (error) {
		throw error;
	}
}
async function sendFinaliseRequest(data) {
	try {
		const headers = { 'Content-Type': 'text/plain' };
		const response = await axios.post(finalise, data, { headers });
		return response;
	} catch (error) {
		throw error;
	}
}

async function sendSimultaneous(data) {
	try {
		const headers = { 'Content-Type': 'application/xml' };
		const response = await axios.post(merge, data, { headers });
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
		const response = await axios.post(purge, data, { headers });
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
		const response = await axios.post(writeDB, data, { headers });
		if (response) {
			return response;
		}
	} catch (error) {
		throw error;
	}
}

async function getFile(queryString, options) {
	try {
		// console.log('in sendToRemote: ', options.TYPE);
		// console.log('options in send to remote.getFile: ', options);
		let formData = new FormData();
		let payload = '';

		const axiosInstance = axios.create({
			method: 'post',
			maxBodyLength: Infinity,
			baseURL: `${process.env.GET_FILE}`
		});

		let config = { url: `?${queryString}` };
		if (options.TYPE === 'movement') {
			formData.append('postdatapassedbyform', options.inputTitle);

			config = {
				...config,
				method: 'post',
				data: formData,
				headers: formHeaders,
				responseType: 'arraybuffer'
			};
		} else if (options.TYPE === 'HTMLNEW') {
			payload = `${options.eventName}\n${options.directorName}\n${
				options.comments ? options.comments : ''
			}`;
			if (options.fileType === 'pdf') {
				config.responseType = 'arraybuffer';
			}

			if (options.fileType === 'html') {
			}
			config = {
				...config,
				data: payload,
				headers: textHeaders
			};
		}

		console.log('Get File Axios Config: ', config);

		const response = await axiosInstance.request(config);
		return response.data;
	} catch (error) {
		console.error('error sending axios: ', error);
		throw error;
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

async function deleteGame(xmlRequest) {
	console.log('Reached send to remote');
	try {
		const delGameUrl = process.env.DELETE_GAME;
		// const xmlRequest = writeDeleteRequest(data);
		// xmlRequest.toString();
		const config = {
			method: 'post',
			url: delGameUrl,
			maxContentLength: Infinity,
			headers: textHeaders,
			data: xmlRequest
		};
		const response = await axios.request(config);
		return response;
	} catch (error) {
		throw error;
	}
}

async function getEBU(queryString, formDataString) {
	const formData = new FormData();
	formData.append('postdatapassedbyform', formDataString);
	const headers = {
		'Content-Type': `multipart/form-data; boundary=${formData.getBoundary}`
	};
	try {
		const config = {
			method: 'post',
			url: `${process.env.GET_FILE}?${queryString}`,
			maxContentLength: Infinity,
			headers: headers,
			data: formData
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
		const { gameCode, formData } = data;
		// const headers = formData.getHeaders();

		const config = {
			method: 'post',
			url: `${process.env.FROM_BW}?SLOT=${gameCode}`,
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
	// console.log('Send Player db payload: ', payload);

	const { file } = payload;
	if (!file) {
		throw new CustomError('Missing xml file');
	}

	const formData = new FormData();
	formData.append('diasel', '4');
	formData.append('diacc', '');
	formData.append('diapass', '');
	formData.append('upload', file);

	const config = {
		method: 'post',
		url: `${process.env.IMPORT_DB}?SLOT=${payload.gameCode}`,
		data: formData,
		maxContentLength: 50 * 1024,
		headers: {
			...formData.getHeaders()
		},
		timeout: 60000
	};

	console.log('Axios config: ', config);

	console.log('about to send to remote');

	try {
		// const response = await axios.request(config);
		const response = await axios.post(config.url, formData, {
			headers: formData.getHeaders(),
			maxContentLength: 50 * 1024,
			timeout: 60000
		});
		console.log('Response received:', response.status, response.statusText);
		return response.data;
	} catch (error) {
		// Log the error object fully to get more details
		console.error('Error during request:', error);
		if (error.response) {
			// Handle response-related errors
			console.error('Response error data:', error.response.data);
			console.error('Response status:', error.response.status);
			console.error('Response headers:', error.response.headers);
		} else if (error.request) {
			// Handle no response received
			console.error('No response received:', error.request);
		} else {
			// Handle errors in setting up the request
			console.error('Error setting up request:', error.message);
		}
		throw new CustomError('Error sending to remote');
	}
}

async function sendChunks(payload, chunkSize) {
	const totalChunks = Math.ceil(payload.length / chunkSize);
	const responses = [];

	for (let i = 0; i < totalChunks; i++) {
		const start = i * chunkSize;
		const end = (i + 1) * chunkSize;
		const chunk = payload.slice(start, end);

		const formData = new FormData();

		formData.append('chunk', chunk);
	}

	try {
	} catch (error) {}
}

async function uploadPbn(payload) {
	try {
		const { formData } = payload;
		const config = {
			method: 'post',
			// url: `${process.env.PBN_URL}`,
			url: process.env.PBN_URL,
			data: formData,
			maxContentLength: Infinity,
			headers: getFormDataHeaders(formData),
			timeout: 20000
		};

		const response = await axios.request(config);

		// console.log('REMOTE RESPONSE:\n', response);

		if (response) {
			return response.status;
		}
	} catch (error) {
		console.error('Error sending data: ', error);
		console.error('Error stack: ', error.stack);
		throw error;
	}
}
// Debug - Uncomment below to log the outgoing axios request

// axios.interceptors.request.use(req => {
// 	console.log('Axios request object: ', JSON.stringify(req, null, 2));
// 	return req;
// });

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
	deleteGame,
	downloadCurrent,
	uploadCurrentSingle,
	restoreGame,
	getEBU,
	getBridgeWebs,
	dbFromBW,
	sendPlayerDb,
	uploadPbn
};
