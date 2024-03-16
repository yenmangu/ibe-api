const axios = require('axios');

async function downloadLinFile(linfilename) {
	try {
		const downloadUrl = `${process.env.LIN_DL}?file=${linfilename}`;

		const config = {
			method: 'get',
			url: downloadUrl
		};

		const responseFile = await axios.request(config);

		return responseFile.data;
	} catch (error) {
		console.error('Error getting lin file: ', error);
		throw error;
	}
}
module.exports = { downloadLinFile };
