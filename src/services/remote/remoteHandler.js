const CustomError = require('../error/error');

const FormData = require('form-data');
const axios = require('axios');

const { env } = process;

const writeDB = env.WRITE_DB || '';
const importDb = env.IMPORT_DB || '';
const putBW = env.PUT_BW || '';
const getFile = env.GET_FILE || '';

const axiosInstance = axios.create();

const uploadDatabaseAsync = async payload => {
	try {
		const { file, gameCode } = payload;
		if (!file) {
			throw new CustomError('No file');
		}
		if (!gameCode) {
			throw new CustomError('No Gamecode in remnote request');
		}
		console.log(`Reached remoteHAndler with ${gameCode}`);

		// console.log('File being sent: ', file);

		const formData = new FormData();
		formData.append('diasel', '4');
		formData.append('diacc', '');
		formData.append('diapass', '');
		formData.append('upload', file);

		if (!formData) {
			throw new CustomError('Error creating form data');
		}

		const response = await axiosInstance.request({
			url: `${importDb}?SLOT=${payload.gameCode}`,
			data: formData,
			maxContentLength: 50 * 1024,
			headers: formData.getHeaders(),
			timeout: 60000
		});
		return response.data;
	} catch (error) {
		handleAxiosError(error);
	}
};

async function uploadToBridgeWebsAsync(payloadString) {
	try {
		const reponse = await axiosInstance.request({
			method: 'post',
			url: putBW,
			data: payloadString,
			headers: { 'Content-Type': 'text/plain' },
			timeout: 30000
		});
		return reponse.data;
	} catch (error) {
		handleAxiosError(error);
	}
}

async function downloadBridgeWebsAsync(paylaodString, gameCode) {
	try {
		const urlString = `${getFile}?SLOT=${gameCode}&TYPE=BRIDGEWEBS&NOWRAP=TRUE`;
		const response = await axiosInstance.request({
			method: 'post',
			url: urlString,
			data: paylaodString,
			headers: { 'Content-Type': 'text/plain' },
			timeout: 30000
		});
		return response.data;
	} catch (error) {
		handleAxiosError(error);
	}
}

// Axios Error Handling / Logging

function handleAxiosError(error) {
	console.error('error in remote handler: ', error);
	if (error.response) {
		throw new CustomError('Error in response');
	}
	if (error.request) {
		throw new CustomError('Error in request');
	}
	throw new CustomError('Error setting up request');
}

axiosInstance.interceptors.request.use(
	config => {
		console.log('Request made with Axios:');
		console.log('URL:', config.url);
		console.log('Method:', config.method);
		console.log('Headers:', config.headers);
		console.log('Data:', config.data);
		return config; // Important: return the config to proceed with the request
	},
	error => {
		console.error('Error in request: ', error);
		return Promise.reject(error);
	}
);

module.exports = {
	uploadDatabaseAsync,
	uploadToBridgeWebsAsync,
	downloadBridgeWebsAsync
};
