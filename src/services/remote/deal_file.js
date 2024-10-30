const axios = require('axios');
const { CustomError } = require('../error/Error');

const clientError = new CustomError();
clientError.message = 'Invalid request';
clientError.status = 400;

async function fetchDealFile(gameCode) {
	try {
		if (!gameCode) {
			clientError.message = 'No game code in fetchDealFile()';
			throw clientError;
		}
		const config = {
			method: 'post',
			maxBodyLength: Infinity,
			url: `https://brianbridge.net/cgi-bin/brian2getfile.cgi?SLOT=${gameCode}&TYPE=EBUP2PXML&NOWRAP=TRUE`,
			headers: {
				'Content-Type': 'application/xml'
			}
		};
		const urlString = `?SLOT=${gameCode}&TYPE=`;
		const response = await axios.get(`${process.env.PIANOLO}`);
	} catch (error) {
		throw error;
	}
}
