const sendToRemote = require('../services/remote/send_to_remote');
const successOrFailure = require('../services/remote/remote_response');
const setupSecurity = require('../services/xml_creation/setup_security');
const scoringXML = require('../services/xml_creation/scoring_xml');
const appInterfaceXML = require('../services/xml_creation/app_interface_xml');
const namingNumberingXML = require('../services/xml_creation/naming_numbering_xml');
const CustomError = require('../services/error');

async function processSettings(bodyData) {
	try {
		console.log('body data: ', JSON.stringify(bodyData, null, 2));
		let xml = undefined;
		const {
			data: { formName }
		} = bodyData;
		if (bodyData.data.formName === 'setupForm') {
			// FOR SETUP ONLY
			console.log('setupForm');
			xml = await setupSecurity.generateNewXml(bodyData);
			// xml = await setupSecurity.generateXMLSnippet(bodyData);
		} else {
			// FOR NOT SETUP
			console.log(formName);
			if (formName === 'boardsScoring') {
				console.log('writing scoring xml');
				xml = await scoringXML.createScoringXML(bodyData);
			}
			if (formName === 'appInterface') {
				console.log('writing app interface xml');
				xml = await appInterfaceXML.writeAppInterfaceXML(bodyData);
			}
			if (formName === 'namingNumbering') {
				console.log('writing naming numbering xml');
				xml = await namingNumberingXML.writeNamingNumberingXML(bodyData);
			}
		}
		if (!xml) {
			const serverError = new CustomError();
			serverError.message = 'Internal Server Errror. No XML from write functions';
			serverError.status = 500;
			throw serverError;
		}

		const xmlString = xml.toString();
		console.log('\n--------------- xml: -----------\n', xmlString);

		const response = await uploadSettings(xmlString);
		// console.log('returned response ************: ', response)
		return response;
	} catch (error) {
		throw error;
	}
}

async function uploadSettings(data) {
	try {
		if (!data) {
		}
		// console.log('data in game_settings: ', data);

		const serverResponse = await sendToRemote.uploadCurrentSettings(data);
		console.log(
			"response from victor's server: ",
			JSON.stringify(serverResponse.data, null, 2)
		);

		const parsedString = await successOrFailure.parseResponseText(
			serverResponse.data
		);
		console.log('parsed string: ', parsedString);
		const tag = 'setwresponse';

		const remoteResponse = successOrFailure.getResponse(parsedString, tag);
		if (remoteResponse) {
			// console.log('remote response----------: ', remoteResponse);

			return remoteResponse;
		} else {
			const serverError = new CustomError('No remote response');
			serverError.status = 500;
			throw serverError;
		}
	} catch (error) {
		throw error;
	}
}

module.exports = { processSettings, uploadSettings };
