const setupSecurity = require('../services/xml_creation/setup_security');
const scoringXML = require('../services/xml_creation/scoring_xml');
const appInterfaceXML = require('../services/xml_creation/app_interface_xml');
const namingNumberingXML = require('../services/xml_creation/naming_numbering_xml');
const settingsController = require('../controllers/game_settings');

const sendToRemote = require('../services/remote/send_to_remote');

async function baseSettings(req, res, next) {
	try {
		const clientError = new Error();

		const bodyData = req.body;
		if (!bodyData) {
			clientError.message = 'No body on request';
			clientError.status = 400;
			throw clientError;
		}
		// console.log(JSON.stringify(bodyData, null, 2));
		const formName = bodyData.data.formName;
		console.log(formName);

		const response = await settingsController.processSettings(bodyData);

		return res.status(200).json({ message: 'Data received', response });
	} catch (error) {
		throw error;
	}
}

module.exports = { baseSettings };

// if (bodyData.data.formName === 'setupForm') {
// 	// FOR SETUP ONLY
// 	console.log('setupForm');
// 	xml = await setupSecurity.generateXMLSnippet(bodyData);
// } else {
// 	// FOR NOT SETUP
// 	console.log(formName);
// 	if (formName === 'boardsScoring') {
// 		console.log('writing scoring xml');
// 		xml = await scoringXML.createScoringXML(bodyData);
// 	}
// 	if (formName === 'appInterface') {
// 		console.log('writing app interface xml');
// 		xml = await appInterfaceXML.writeAppInterfaceXML(bodyData);
// 	}
// 	if (formName === 'namingNumbering') {
// 		console.log('writing naming numbering xml');
// 		xml = await namingNumberingXML.writeNamingNumberingXML(bodyData);
// 	}
// }
// if (!xml) {
// 	const serverError = new Error();
// 	serverError.message = 'Internal Server Errror. No XML from write functions';
// 	serverError.status = 500;
// 	throw serverError;
// }

// const xmlString = xml.toString()

// console.log('string xml: ', xml.toString());

// const response = await settingsController.uploadSettings(xmlString);
