const xmlController = require('../controllers/xml_controllers/xml_controller');
const currentGameController = require('../controllers/current_game');

exports.pocessTableConfig = async (req, res, next) => {
	try {
		console.log('process table config route handler invoked');
		// return
		const body = req.body;
		if (!body) {
			// console.log('no body in request');
			const clientError = new Error('No body in request');
			clientError.status = 400;
			throw clientError;
		}

		// console.log('body: ', JSON.stringify(body, null, 2));
		// return
		const {
			dir_key,
			game_code,
			dateFormData,
			data: { eventName, tableFormData }
		} = body;
		const { formData, changedFields } = tableFormData;

		console.log('data in processTableConfig: ', body);
		console.log('tableFormData in processTableConfig: ', tableFormData);
		// console.log('\n ******* Event name: ', eventName, '\n *******');

		const processedXML = await xmlController.processCurrentGame(
			dir_key,
			game_code,
			formData,
			changedFields,
			dateFormData,
			eventName
		);

		console.log('processed XML: ', processedXML);

		// Do not send to remote
		// return;

		const remoteSuccess = await currentGameController.remoteCommunication(
			processedXML
		);
		console.log('Remote Success: ', remoteSuccess);

		const responseObject = {
			remote_response: remoteSuccess
		};
		const { success, sf, err } = remoteSuccess;
		if (success) {
			res.status(200).json(responseObject);
		}
		let message = '';
		if (!success && sf === 'f') {
			if (err === 'nopassgiven') {
				message = 'NO_PASS';
			}
			if (err === 'wrongpass') {
				message = 'WRONG_PASS';
			}
			if (err === 'nogamedir') {
				message = 'NO_DIR';
			}
			if (err === 'noslotgiven') {
				message = 'NO_GAMECODE';
			}
			return res.status(401).json({ message, remoteSuccess });
		}

		if (!remoteSuccess) {
			const remoteError = new Error('Error in response from remote');
			remoteError.status = 500;
			throw remoteError;
		}
	} catch (error) {
		// console.error(error);
		next(error);
	}
};
