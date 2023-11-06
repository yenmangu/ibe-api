async function writeActionsText(data, action) {
	try {
		console.log('data in text write: ', data);

		const { gameCode, setLock } = data;
		// gameCode = 'pairdum';

		let gameAction = '';
		let payloadString = `-v-10126j-v-${gameCode} `;
		if (action === 'finalise') {
			gameAction = '';
		}
		if (action === 'lock') {
			gameAction = setLock === true ? (action = 'SETLOCK y') : 'SETLOCK n';
		}

		if (action === 'purge') {
			gameAction = 'CLEARALLRES';
			// return { text: 'reached purge' };
		}
		payloadString = payloadString + gameAction;
		console.log('payloadString: ', payloadString);
		return payloadString;
	} catch (error) {
		throw error;
	}
}
module.exports = { writeActionsText };
