const fs = require('fs').promises;
const path = require('path');

class XmlFileService {
	static async saveXmlToFile(xmlData) {
		try {
			const filePath = path.resolve(
				path.join(__dirname, '..','..', 'temp', 'response.xml')
			);
			console.log('filepath: ', filePath);

			await fs.writeFile(filePath, xmlData);
			return filePath;
		} catch (error) {
			throw new Error('Error saving xml to file');
		}
	}
}
module.exports = XmlFileService