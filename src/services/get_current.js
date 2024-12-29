/**
 * @type {import('axios')}
 */
const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.resolve(path.join(__dirname, '..', '..', '.env')) });
const controller = new AbortController();
/**
 * @typedef {Object} AuthData
 * @property {string} game_code
 * @property {string} dir_key
 */

// /**
//  * Fetches current data from the server
//  * @param {AuthData} authData
//  * @returns {Promise<import('axios').AxiosResponse>}
//  */
async function getCurrentData(authData) {
	try {
		if (!authData) {
			throw new Error('No auth data');
		}

		let data = `${authData.game_code}\nDIRPASS\n${authData.dir_key}`;

		// /**
		//  * @type {import('axios').AxiosRequestConfig}
		//  */

		const config = {
			method: 'post',
			url: `${process.env.SITE_AUTH}`,
			headers: {
				'Content-Type': 'application/xml'
			},
			timeout: 10000,
			// signal: controller.signal,
			data: data
		};
		// /**
		//  * Makes a request using axios
		//  *
		//  * @returns {Promise<import("axios").AxiosResponse>} response
		//  */
		const response = await axios.request(config);
		return response;
	} catch (err) {
		throw err;
	}
}
module.exports = { getCurrentData };
