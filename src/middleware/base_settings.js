const setupSecurity = require('../services/xml_creation/setup_security');
const scoringXML = require('../services/xml_creation/scoring_xml');
const appInterfaceXML = require('../services/xml_creation/app_interface_xml');
const namingNumberingXML = require('../services/xml_creation/naming_numbering_xml');
const settingsController = require('../controllers/game_settings');

const sendToRemote = require('../services/remote/send_to_remote');
const CustomError = require('../services/error/error');

async function baseSettings(req, res, next) {
	try {
		const clientError = new CustomError();

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
		next(error);
	}
}

module.exports = { baseSettings };
