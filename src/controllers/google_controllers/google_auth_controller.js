const { google } = require('googleapis');
const { authenticate } = require('@google-cloud/local-auth');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs').promises;
const process = require('process');

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
// const WEB_CREDENTIALS_PATH = path.resolve(
// 	__dirname,
// 	'..',
// 	'..',
// 	'..',
// 	'G_API',
// 	'web_app_credentials.json'
// );

// const REFRESH_TOKEN_PATH = path.resolve(
// 	__dirname,
// 	'..',
// 	'..',
// 	'..',
// 	'G_API',
// 	'refresh_token.json'
// );
// const TOKEN_PATH = path.resolve(__dirname, '..', '..', '..', 'G_API', 'token.json');
const SERVICE_TOKEN_PATH = path.resolve(
	__dirname,
	'..',
	'..',
	'..',
	'G_API',
	'service_token.json'
);

async function loadSavedCredentialsIfExist() {
	try {
		const content = await fs.readFile(SERVICE_TOKEN_PATH);
		const credentials = JSON.parse(content);
		return google.auth.fromJSON(credentials);
	} catch (err) {
		return null;
	}
}

// Save credentials to file compatible with googleAuth.fromJSON()

async function saveCredentials(client) {
	const content = await fs.readFile(SERVICE_CREDENTIALS_PATH);
	const keys = JSON.parse(content);
	const key = keys;
	const payload = JSON.stringify({
		type: 'service_account',
		client_id: key.client_id,
		client_secret: key.client_secret,
		refresh_token: client.credentials.refresh_token
	});
	await fs.writeFile(SERVICE_TOKEN_PATH, payload);
}

async function authorize() {
	let client = await loadSavedCredentialsIfExist();
	if (client) {
		return client;
	}
	client = await authenticate({
		scopes: SCOPE,
		keyfilePath: SERVICE_CREDENTIALS_PATH
	});
	if (client.credentials) {
		await saveCredentials(client);
	}
	return client;
}

// this returns the client
authorize().then(client => {
	console.log(client);
});

module.exports = {
	authorize
};
