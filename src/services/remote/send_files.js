const axios = require('axios');
const FormData = require('form-data');
const remoteResponse = require('./remote_response');

const BBO_ROUTE = process.env.BBO_ROUTE;
const USEBIO_ROUTE = process.env.USEBIO_ROUTE;
const PUT_HAND_RECORD = process.env.PUT_HAND_RECORD;

const responseError = new Error();
responseError.message = 'Error sending to remote server';
responseError.status = 500;

async function uploadBBO(data) {
	console.log('data in uploadBBO: ', data);
	try {
		const slot = data.gameCode;
		const files = data.files;

		const formData = new FormData();

		files.forEach(file => {
			formData.append('upload', file.buffer, {
				filename: file.originalname,
				contentType: file.mimetype
			});
		});

		console.log('formData in uploadBBO: ', formData);

		const headers = formData.getHeaders();

		const response = await axios.post(`${BBO_ROUTE}?SLOT=${slot}`, formData, {
			headers
		});
		console.log('\n\nresponse data from bbo upload \n\n', response.data);
		console.log(typeof response.data);

		return response.data;
	} catch (error) {
		responseError.data = error;
		throw responseError;
	}
}

async function uploadUSEBIO(data) {
	try {
		const slot = data.gameCode;
		const file = data.files;
		const formData = new FormData();
		formData.append('upload', file.buffer, {
			filename: file.originalname,
			contentType: file.mimetype
		});

		const headers = formData.getHeaders();
		const response = await axios.post(`${USEBIO_ROUTE}?SLOT=${slot}`, formData, {
			headers
		});

		return response.data;
	} catch (error) {
		responseError.data = error;
		throw responseError;
	}
}

async function uploadHandConfig(data) {
	try {
		const slot = data.dirkey;
		const file = data.file;
		const formData = new FormData();
		formData.append('diasel', '1');
		formData.append('upload', file);
		const headers = formData.getHeaders();

		const respose = await axios.post(`${PUT_HAND_RECORD}?SLOT=${slot}`, formData, {
			headers
		});
		const output = await remoteResponse.getRemoteResponse(respose.data);

		const responseData = {
			message: 'Success uploading to the remote server',
			remoteResult: '',
			XMLResponse: output,
			XMLFile: respose.data
		};
		responseData.remoteResult = remoteResponse.mapRemoteResponse(output);
		return responseData;
	} catch (error) {
		responseError.data = error;
		throw responseError;
	}
}

module.exports = {
	uploadHandConfig,
	uploadBBO,
	uploadUSEBIO
};
