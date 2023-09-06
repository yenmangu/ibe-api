const path = require('path');
const fs = require('fs');

function writeResponseToFile(response, directory) {
	const responseDir = path.join(__dirname, '..','..', directory);
	const xmlResponse = response.data;

	const currentDate = new Date();
	const formattedDate = currentDate.toISOString().replace(/:/g, '');

	const newfileName = `response_${formattedDate}.xml`;

	fs.writeFile(path.join(responseDir, newfileName), xmlResponse, err => {
		if (err) {
			console.log('error writing to directory', err);
		} else {
			console.log('successfully written to directory');
		}
	});
}
module.exports = writeResponseToFile
