const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.resolve(path.join(__dirname, '..', '..', '.env')) });

async function getCurrentData(authData) {
	try {
		if (!authData) {
			throw new Error('No auth data');
		}

		let data = `${authData.game_code}\nDIRPASS\n${authData.dir_key}`;

		const config = {
			method: 'post',
			url: `${process.env.SITE_AUTH}`,
			headers: {
				'Content-Type': 'application/xml'
			},
			data: data
		};
		const response = await axios.request(config);
		return response;
	} catch (err) {
		throw err;
	}
}
module.exports = { getCurrentData };
