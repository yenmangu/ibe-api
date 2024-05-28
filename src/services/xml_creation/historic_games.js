const { create } = require('xmlbuilder2');

function writeDeleteRequest(data) {
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
	return xmlRequest;
}
module.exports = writeDeleteRequest;
