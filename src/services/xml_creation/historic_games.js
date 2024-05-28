const { create } = require('xmlbuilder2');

async function writeDeleteRequest(data) {
	try {
		const { gameCode, dirKey, zipName } = data;
		const xmlObject = {
			histdelrequest: {
				'@version': '1.0',
				'@encoding': 'ISO-8859-1',
				'@svs': `-v-10126j-v-${gameCode}`,
				'@pass': dirKey,
				'@zipname': zipName
			}
		};
		const xmlRequest = create(xmlObject);
		const xmlDoc = xmlRequest.end({ prettyPrint: true });
		return xmlDoc;
	} catch (error) {
		throw error;
	}
}
module.exports = writeDeleteRequest;
