const path = require('path');
const FormData = require('form-data');
const fs = require('fs').promises;
const createReadStream = require('fs').createReadStream;
const { readFileAsync, writeFileAsync } = require('../../services/file_service');
const xmlService = require('../../services/xml_processing/xml_service');
const compressJSON = require('../../services/compression');
const player_cardinal_extraction = require('../../services/data_transform');
const databaseXml = require('../../services/xml_creation/database_xml');
const sendToRemote = require('../../services/remote/send_to_remote');
const remoteRresponse = require('../../services/remote/remote_response');
const xmlFileService = require('../../services/file_creation/xml_file_creation');
const { CustomError } = require('../../services/error/Error');
const remoteHandler = require('../../services/remote/remoteHandler');

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
		if (!result) {
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
		const {
			root: [
				{
					['$']: { rev }
				}
			]
		} = parsedContent.playerdb;
		console.log('rev: ', rev);

		parsedContent.currentDBRevision = rev;

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

async function processCurrentGame(
	dir_key,
	game_code,
	formData,
	changedFields,
	dateFormData,
	eventName,
	teams = false
) {
	try {
		// console.log('xml controller invoked');
		// console.log('all form data in xml controller: ', formData, '\n');
		console.log('Teams? :', teams);

		// console.log('formData in xml controller: ', formData);

		const currentMatchArrays = player_cardinal_extraction.extractCardinalPlayers(
			formData,
			teams
		);
		console.log('Current Match Arrays:  ', currentMatchArrays);

		const currentGameXML = await xmlService.createCurrentGameXML(
			dir_key,
			game_code,
			currentMatchArrays,
			eventName
		);

		// console.log('Current Game XML: \n', currentGameXML);
		// return
		return currentGameXML;
	} catch (error) {
		throw error;
	}
}

async function processPlayerDatabase(data) {
	try {
		console.log('process player database controller invoked with: ', data);
		let xmlData;
		if (data.existingName) {
			xmlData = xmlService.updateDatabase(data);
		} else {
			xmlData = xmlService.writePlayerDb(data);
			console.log('xml data: ', xmlData);
		}
		return xmlData;
	} catch (error) {
		throw error;
	}
}

async function coordinateDataExtraction(xmlData, elementName) {
	try {
		const santisedXml = xmlService.sanitiseXml(xmlData);
		const parsedXml = await xmlService.parseXML(santisedXml);
		const playerDBJson = await parsedXml.siteauthresponse.playerdb;
		const playerDBXml = await databaseXml.writeDatabaseXml(playerDBJson);
		// console.log(playerDBXml);
		// console.log('Parsed playerdb XML: ', JSON.stringify(parsedXml, null, 2));
		return playerDBXml;
	} catch (error) {
		throw error;
	}
}

async function importEntirePlayerDb(data) {
	try {
		// console.log('importEntirePlayerDb data: ', data);
		const { gameCode, dirKey, importData, meta } = data;

		// console.log('Import Entire DB data: ', gameCode, importData);

		// const dataRows = importData.slice(1);

		const xmlString = await databaseXml.writeDbFromCsv(importData);
		xmlString.trim();
		console.log('XML received from XML service.');

		const xmlFilePath = await xmlFileService.saveXmlToFile(xmlString.trim());
		const readStream = await readFileAsync(xmlFilePath, 'UTF-8');
		console.log('Read stream created');

		// const xmlResponse = await sendToRemote.sendPlayerDb({ readStream, gameCode });
		const xmlResponse = await sendToRemote.sendPlayerDb({ xmlString, gameCode });

		const remoteResult = await remoteRresponse.getResponseAndError(xmlResponse);
		const response = {
			success: false,
			error: ''
		};
		let success = false;
		let remoteError = '';
		if (remoteResult.sfAttribute === 's') {
			response.success = true;
		} else if (remoteResult.sfAttribute === 'f') {
			console.log('Server response: ', xmlResponse);
			console.log('Server result: ', remoteResult);

			response.error = remoteResult.errAttribute;
		}

		console.log('remote result: ', remoteResult);

		// console.log('response', response);
		//
		return response;
	} catch (error) {
		throw error;
	}
}

async function coordinateDbDelete(data) {
	try {
		const { gameCode } = data;
		console.log(`Deleting entry with gameCode: ${gameCode}`);
		const emptyXml = await databaseXml.writeEmpty();
		// console.log('empty xml: ', emptyXml);

		// return;

		const xmlFilePath = await xmlFileService.saveXmlToFile(emptyXml.trim());
		// const file = await readFileAsync(xmlFilePath, 'UTF-8');
		const file = createReadStream(xmlFilePath);

		// const xmlResponse = await sendToRemote.sendPlayerDb({ file, gameCode });
		const xmlResponse = await remoteHandler.uploadDatabaseAsync({ file, gameCode });
		console.log('xmlResponse: ', xmlResponse);

		const remoteResult = await remoteRresponse.getResponseAndError(xmlResponse);

		const response = {
			success: false,
			error: ''
		};

		if (remoteResult.sfAttribute === 's') {
			response.success = true;
		} else if (remoteResult.sfAttribute === 'f') {
			response.error = remoteResult.errAttribute;
		}
		return response;
	} catch (error) {
		throw error;
	}
}

module.exports = {
	readXmlFileControllerDev,
	processJSON,
	processXML,
	processCurrentGame,
	processPlayerDatabase,
	coordinateDataExtraction,
	importEntirePlayerDb,
	coordinateDbDelete
};
