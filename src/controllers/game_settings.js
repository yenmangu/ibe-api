const sendToRemote = require('../services/send_to_remote');
const successOrFailure = require('../services/remote_response');
const setupSecurity = require('../services/setup_security');
const scoringXML = require('../services/scoring_xml');
const appInterfaceXML = require('../services/app_interface_xml');
const namingNumberingXML = require('../services/naming_numbering_xml');


async function processSettings (bodyData){
	try {
		let xml = undefined
		if (bodyData.data.formName === 'setupForm') {
			// FOR SETUP ONLY
			console.log('setupForm');
			xml = await setupSecurity.generateXMLSnippet(bodyData);
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
			const serverError = new Error();
			serverError.message = 'Internal Server Errror. No XML from write functions';
			serverError.status = 500;
			throw serverError;
		}

		const xmlString = xml.toString()
		const response = await uploadSettings(xmlString)



	} catch (error) {
		throw error
	}
}

async function uploadSettings(data) {
	try {
		if (!data) {
		}
		console.log('data in game_settings: ', data);

		const serverResponse = await sendToRemote.uploadCurrentSettings(data);
		const parsedString = await successOrFailure.parseResponseText(
			serverResponse.data
		);
		console.log('parsed string: ', parsedString);
		const tag = 'setwresponse'

		const remoteResponse = successOrFailure.getResponse(parsedString, tag);
		if (remoteResponse) {



			return remoteResponse;


		} else {
			const serverError = new Error('No remote response');
			serverError.status = 500;
			throw serverError;
		}
	} catch (error) {
		throw error;
	}
}

module.exports = { processSettings,uploadSettings };
