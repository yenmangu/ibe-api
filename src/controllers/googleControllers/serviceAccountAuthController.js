const { google } = require('googleapis');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs').promises;

dotenv.config();

const SCOPE = [
	'https://www.googleapis.com/auth/drive.metadata.readonly',
	'https://www.googleapis.com/auth/userinfo.profile',
	'https://www.googleapis.com/auth/drive.file',
	'https://www.googleapis.com/auth/spreadsheets'
];

const SERVICE_CREDENTIALS_PATH = path.resolve(
	__dirname,
	'..',
	'..',
	'..',
	'G_API',
	'service_credentials.json'
);
const SERVICE_TOKEN_PATH = path.resolve(
	__dirname,
	'..',
	'..',
	'..',
	'G_API',
	'service_token.json'
);

// read credentials from files
async function readCredentials(path) {
	try {
		const credentials = await fs.readFile(path);
		const keys = JSON.parse(credentials);
		// console.log(keys)
		return keys;
	} catch (err) {
		console.error(err);
	}
}

async function createAuthClient() {
	const serviceCredentials = await readCredentials(SERVICE_CREDENTIALS_PATH);
	try {
		const authClient = new google.auth.JWT({
			email: serviceCredentials.client_email,
			key: serviceCredentials.private_key,
			scopes: SCOPE
		});
		return new Promise((resolve, reject) => {
			authClient.authorize((err, tokens) => {
				if (err) {
					console.error('Error Authenticating', err);
					reject(err);
				}
				console.log('Authentication Successful');
				resolve(authClient);
			});
		});
	} catch (err) {
		console.error(err);
	}
}
// createAuthClient()
// 	.then(client => {
// 		console.log(client);
// 	})
// 	.catch(err => {
// 		console.error('Error: ', err);
// 	});
module.exports = createAuthClient;
