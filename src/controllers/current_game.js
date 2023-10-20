const sendToRemote = require('../services/send_to_remote');
const succesOrFailure = require('../services/remote_response.js');

async function remoteCommunication(xmlData) {
	try {
		console.log('xmlData in remoteComms: ', xmlData);
		const serverResponse = await sendToRemote.uploadCurrentConfig(xmlData);
		// console.log('remote response.data: ', serverResponse.data);

		const parsedString = await succesOrFailure.parseResponseText(
			serverResponse.data
		);
		const remoteResponse = succesOrFailure.getResponse(parsedString, 'gnvresponse');
		console.log('remote response in current game controller: ', remoteResponse);
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
module.exports = { remoteCommunication };
