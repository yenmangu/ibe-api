function createBridgeWebsFormdata(data) {
	try {
		if (!data) {
			throw new Error('No data in createBridgeWebsFormdata function');
		}
		const formData = new FormData();
		const blankFile = new Blob([''], { type: 'application/octet-stream' });
		formData.append('diasel', '1');
		if (data.contactInfo) {
			formData.append('diaupfrombwincpdcb', 'on');
		}
		if (data.excludePlayers) {
			formData.append('diaupfrombwdelcb', 'on');
		}
		formData.append('diaacc', data.bwAccount);
		formData.append('diapass', data.bwPass);
		formData.append('upload', blankFile);

		return formData;
	} catch (error) {
		throw error;
	}
}
module.exports = { createBridgeWebsFormdata };
