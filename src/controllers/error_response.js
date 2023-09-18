const fs = require('fs');
const { parseString } = require('xml2js');

function parseError(errorString) {
	const lines = errorString.split('\n');
	const resultLine = lines[0];
	const reasonLine = lines[1];

	const failure = resultLine.trim().toLowerCase() === 'failure';
	const reason = failure ? reasonLine.trim() : '';
	return { failure, reason };
}

const successCheck = response => {
	let success = false;
	result = response[0].trim().toLowerCase();
	if (result !== 'success') {
		console.log("Error from victor's server");
		throw new Error();
	} else {
		success = true;
	}
	return success;
};

function findErrorTag(xmlData) {
	return new Promise((resolve, reject) => {
		parseString(xmlData, (err, results) => {
			if (err) {
				console.error('error parsing XML', err);
				reject(err);
			} else {
				const errorTagContents = result.error;
				resolve(errorTagContents);
			}
		});
	});
}
module.exports = { parseError, successCheck, findErrorTag };
