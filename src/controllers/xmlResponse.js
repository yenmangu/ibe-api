const xml2js = require('xml2js');

async function getRemoteResponse(xmlResponse) {
	return new Promise((resolve, reject) => {
		// const parseString = xml2js.Parser()
		xml2js.parseString(xmlResponse, (err, result) => {
			if (err) {
				reject(err);
			} else {
				const rootTag = Object.keys(result)[0];
				const sfAttribute = result[rootTag]?.$?.sf;
				resolve(sfAttribute);
			}
		});
	});
}
module.exports = getRemoteResponse
