const google = require('googleapis');

const authController = require('./googleAuthController');
const { createImportSpecifier } = require('typescript');

async function listFiles(authClient) {
	const drive = google.drive({ version: 'v3', auth: authClient });
	const res = await drive.files.list({
		pageSize: 10,
		fields: 'nextPageToken, files(id, name)'
	});
	const files = res.data.files;
	if (files.length === 0) {
		console.log('No Files Found');
		return;
	}
	console.log('Files: ');
	files.map(file => {
		console.log(`${file.name} ${file.id}`);
	});
}

// prettier-ignore
authController.authorize()
	.then(listFiles)
	.catch(err => {
		console.error(err);
	});
