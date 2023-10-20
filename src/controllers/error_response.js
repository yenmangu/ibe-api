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

async function determineSuccess(xmlData) {
	console.log('xml response: ', xmlData);

	try {
		// Parse the error information
		const { failure, reason } = parseError(xmlData);

		// Check if it's a success response
		const success = successCheck(xmlData);

		// If it's a failure, return the reason
		if (failure) {
			return { success: false, reason };
		}

		// If it's a success, return success
		return { success: true };
	} catch (error) {
		console.error('Error determining success:', error);
		throw new Error('Error determining success');
	}
}

module.exports = { parseError, successCheck, findErrorTag, determineSuccess };
