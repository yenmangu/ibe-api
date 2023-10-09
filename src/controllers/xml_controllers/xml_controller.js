const path = require('path');
const { readFileAsync, writeFileAsync } = require('../../services/file_service');
const xmlService = require('../../services/xml_service');
const compressJSON = require('../../services/compression');

let counter = 1;

async function readXmlFileControllerDev(filename) {
	const fileDirPath = path.resolve(__dirname, '../../../dev_data/xml');
	const filePath = path.join(fileDirPath, filename);
	const encoding = 'utf-8';

	try {
		const fileContent = await readFileAsync(filePath, encoding);
		const parsedContent = await xmlService.convertXMLtoJSON(fileContent);
		if (parsedContent) {
			console.log('Success reading XML');

			const compressed = await compressJSON(parsedContent);
			// const compressed = parsedContent;
			if (compressed) {
				return compressed;
			} else {
				throw new Error('Error Compressing');
			}
		} else {
			throw new Error('Error Parsing XML');
		}
	} catch (err) {
		console.error(err);
		return { error: 'Internal Server Error' };
	}
}

// JSON Intake Controller
async function processJSON(jsonData) {
	try {
		if (!jsonData) {
			throw new Error('No JSON found in "xml_controller"');
		}

		const response = await xmlService.convertJSONtoXML(jsonData);
		if (!response) {
			throw new Error('No response from "xmlService.convertJSONtoXML."');
		}
		const newPath = '../../../dev_data/test_returned/';
		const filePath = path.resolve(
			path.join(
				__dirname,
				'../',
				'../',
				'../',
				'dev_data',
				'test_returned',
				'test.xml'
			)
		);

		const result = await writeFileAsync(filePath, response, 'utf-8');
		if (!result || result === false) {
			throw new Error('Error writing file');
		}
		return result;
	} catch (err) {
		console.error('Error occurred in the "xml_controller" see: ', err);
	}
}

async function processXML(xmlData) {
	try {
		if (!xmlData) {
			throw new Error('No XML Data');
		}

		const parsedContent = await xmlService.convertXMLtoJSON(xmlData);
		if (!parsedContent) {
			throw new Error('Error parsing XML');
		}
		const compressed = await compressJSON(parsedContent);
		if (compressed) {
			return compressed;
		} else {
			throw new Error('Error Compressing');
		}
	} catch (err) {
		throw err;
	}
}

module.exports = {
	readXmlFileControllerDev,
	processJSON,
	processXML
};
