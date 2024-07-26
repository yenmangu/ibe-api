const { parseString } = require('xml2js');
const { CustomError, buildCustomError } = require('../error/Error');

// Used in the send_to_remote send_files

async function getRemoteResponse(xmlResponse) {
	return new Promise((resolve, reject) => {
		// const parseString = xml2js.Parser()
		parseString(xmlResponse, (err, result) => {
			if (err) {
				reject(err);
			} else {
				const rootTag = Object.keys(result)[0];

				const sfAttribute = result[rootTag]?.$?.sf;
				resolve(sfAttribute);
			}
		});
	});
}
async function getResponseAndError(xmlResponse) {
	return new Promise((resolve, reject) => {
		// const parseString = xml2js.Parser()
		parseString(xmlResponse, (err, result) => {
			if (err) {
				reject(err);
			} else {
				const resolution = {};
				const rootTag = Object.keys(result)[0];
				const sfAttribute = result[rootTag]?.$?.sf;

				resolution.sfAttribute = sfAttribute;

				const errAttribute = result[rootTag]?.$?.err;
				if (errAttribute) {
					resolution.errAttribute = errAttribute;
				}

				resolve(resolution);
			}
		});
	});
}

function mapRemoteResponse(input) {
	switch (input) {
		case 's':
			return 'SUCCESS';
			break;
		case 'f':
			return 'FAIL';
			break;
		default:
			return 'ERROR';
	}
}

function parseError(errorString) {
	const lines = errorString.split('\n');
	const resultLine = lines[0];
	const reasonLine = lines[1];

	const failure = resultLine.trim().toLowerCase() === 'failure';
	const reason = failure ? reasonLine.trim() : '';
	return { failure, reason };
}

const succesCheck = response => {
	let success = false;
	const result = response[0].trim().toLowerCase();
	if (result !== 'success') {
		const serverError = new CustomError('CustomError from remote server');
		serverError.status = 500;
		throw serverError;
	} else {
		success = true;
	}
	return success;
};

function findErrorTag(xmlData) {
	return new Promise((resolve, reject) => {
		parseString(xmlData, (err, results) => {
			if (err) {
				console.error('CustomError parsing XML');
				reject(err);
			} else {
				const errorTagContents = results.error;
				resolve(errorTagContents);
			}
		});
	});
}

async function determineSuccess(xmlData) {
	try {
		const { failure, reason } = parseError(xmlData);
		console.log('Failure: ', failure, '. Reason: ', reason);

		const success = succesCheck(xmlData);
		if (failure) {
			return { success: false, reason };
		}
		return { success: true };
	} catch (error) {
		throw new CustomError('CustomError determining success');
	}
}

function parseResponseText(xmlData) {
	// console.log('xmlData: ', xmlData);

	return new Promise((resolve, reject) => {
		parseString(xmlData, (err, result) => {
			if (err) {
				reject(err);
			} else {
				// console.log(
				// 	'Unmodified response from parseString: ',
				// 	JSON.stringify(result, null, 2)
				// );
				resolve(result);
			}
		});
	});
}

function getResponse(parsedString, tag) {
	// console.log('the actual parsed string from the parseResponseText', parsedString);

	const XMLResponse = parsedString[tag];
	if (XMLResponse && XMLResponse['$'] && XMLResponse['$']['sf']) {
		const sf = XMLResponse['$']['sf'];

		let responseObject = {
			success: false
		};

		if (sf === 's') {
			responseObject.success = true;
			responseObject.sf = 's';
			console.log('Success:', responseObject);
			return responseObject;
		} else if (sf === 'f' && XMLResponse['$']['err']) {
			const reason = XMLResponse['$']['err'];
			console.log('Non-success response:', sf, '. Reason: ', reason);
			responseObject.sf = sf;
			responseObject.err = reason;
			return responseObject;
		} else {
			responseObject.err = 'INTERNAL ERROR';
			return responseObject;
		}
	} else {
		console.log(`No ${XMLResponse} or sf in parsed XML`);
		const serverError = new CustomError('sf in XML not found');
		serverError.status = 500;
		throw serverError;
	}
	// console.log('lines from parsed string: ',lines);
}

module.exports = {
	getRemoteResponse,
	mapRemoteResponse,
	parseError,
	succesCheck,
	findErrorTag,
	determineSuccess,
	parseResponseText,
	getResponse,
	getResponseAndError
};
