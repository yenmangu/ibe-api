const zlib = require('zlib');

async function compressJSON(json) {
	return new Promise((resolve, reject) => {
		try {
			const jsonString = JSON.stringify(json);

			zlib.gzip(jsonString, (err, compressedData) => {
				if (err) {
					console.error(err);
					throw new Error('Error Compressing');
				} else {
					resolve(compressedData);
				}
			});
		} catch (err) {
			console.error('Error Compressing JSON');
			reject(err);
		}
	});
}
module.exports = compressJSON;
