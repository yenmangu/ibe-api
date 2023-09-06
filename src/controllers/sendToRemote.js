const axios = require('axios');
const dotenv = require('dotenv');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const getRemoteResponse = require('./xmlResponse');
const writeResponseToFile = require('./saveResponse');
const errorResponse = require('./errorResponse');

dotenv.config();

const BBO_ROUTE = process.env.BBO_ROUTE;
const USEBIO_ROUTE = process.env.USEBIO_ROUTE;
const PUT_HAND_RECORD = process.env.PUT_HAND_RECORD;

// BBO Digest
const uploadBBO = async (req, res, next) => {
	// console.log(req)
	try {
		if (!req.files) {
			res.status(400).json({ message: 'No files detected' });
		}
		const files = req.files;
		console.log(req.files);
		// return;
		const slot = decodeURIComponent(req.query.slot);

		const formData = new FormData();

		files.forEach(file => {
			formData.append('upload', file.buffer, {
				filename: file.originalname,
				contentType: file.mimetype
			});
		});

		const headers = formData.getHeaders();

		const response = await axios.post(`${BBO_ROUTE}?SLOT=${slot}`, formData, {
			headers
		});

		// console.log(response);
		// return
		const output = await getRemoteResponse(response.data);

		// adding debuging for victor
		const responseData = {
			message: 'Success uploading to the remote server',
			remoteResult: '',
			XMLResponse: output,
			XMLFile: response.data
		};

		if (output === 's') {
			responseData.remoteResult = 'SUCCESS';
		} else if (output === 'f') {
			responseData.remoteResult = 'FAIL';
		} else {
			responseData.remoteResult = 'ERROR';
		}

		console.log('output: ', output);
		res.status(200).json({ responseData });
	} catch (err) {
		console.error('Internal Server Error', err);
		console.log('error is: ', err);
		res.status(500).json({ message: 'Error uploading to the remote server.', err });
	}
};

// USEBIO Digest
const uploadUSEBIO = async (req, res, next) => {
	// console.log(req)
	// return

	try {
		console.log(req.files);
		if (!req.files) {
			return res.status(400).json({ message: 'No USEBIO file detected' });
		}
		// return
		const files = req.files;
		console.log('files in uploadUSEBIO: ', req.files);
		// return;

		// Use to test if current slot not working
		const slot = decodeURIComponent(req.query.slot);
		// const slot = 'vil'

		const formData = new FormData();

		files.forEach(file => {
			formData.append('upload', file.buffer, {
				filename: file.originalname,
				contentType: file.mimetype
			});
		});

		console.log(formData);

		const headers = formData.getHeaders();
		const response = await axios.post(`${USEBIO_ROUTE}?SLOT=${slot}`, formData, {
			headers
		});
		// console.log(response);
		// return
		const output = await getRemoteResponse(response.data);

		const responseData = {
			message: 'Success uploading to the remote server',
			remoteResult: '',
			XMLResponse: output,
			XMLFile: response.data
		};

		if (output === 's') {
			responseData.remoteResult = 'SUCCESS';
			// errorTag = 'No error';
		} else if (output === 'f') {
			responseData.remoteResult = 'FAIL';
		} else {
			responseData.remoteResult = 'ERROR';
		}

		console.log('output: ', output);
		res.status(200).json({ responseData });
	} catch (err) {
		console.error('Internal Server Error', err);
		console.log('error is: ', err);
		res.status(500).json({ message: 'Error uploading to the remote server.', err });
	}
};

// Normal Hand Configs
const uploadHandConfig = async (req, res, next) => {
	// console.log(req)
	// return
	console.log(req.file);
	if (!req.files) {
		return res.status(400).json({ message: 'No hand record file detected, exiting route.' });
	}
	try {
		// return
		const file = req.files[0];
		console.log('files in uploadHandConfig(): ', req.files);
		// return;
		const slot = decodeURIComponent(req.query.slot);

		// Use for testing if current slot is not working
		// const slot = 'vil'
		const formData = new FormData();

		formData.append('diasel', '1');
		formData.append('upload', file);
		console.log(formData);

		const headers = formData.getHeaders();
		const response = await axios.post(`${PUT_HAND_RECORD}?SLOT=${slot}`, formData, {
			headers
		});
		// console.log(response);
		// return
		const output = await getRemoteResponse(response.data);

		const responseData = {
			message: 'Success uploading to the remote server',
			remoteResult: '',
			XMLResponse: output,
			XMLFile: response.data
		};

		if (output === 's') {
			responseData.remoteResult = 'SUCCESS';
		} else if (output === 'f') {
			responseData.remoteResult = 'FAIL';
		} else {
			responseData.remoteResult = 'ERROR';
		}
		console.log('output: ', output);

		res.status(200).json({ responseData });
	} catch (err) {
		console.error('Internal Server Error', err);
		console.log('error is: ', err);
		res.status(500).json({ message: 'Error uploading to the remote server.', err });
	}
};

module.exports = {
	uploadBBO,
	uploadUSEBIO,
	uploadHandConfig
};
