const fs = require('fs').promises;
const path = require('path');

class XmlFileService {
	static async saveXmlToFile(xmlString) {
		try {
			const filePath = path.resolve(
				path.join(__dirname, '..', '..', 'temp', 'response.xml')
			);
			// console.log('XML File Path: ', filePath);
			fs.writeFile(filePath, xmlString);
			return filePath;
		} catch (error) {
			throw new Error('Error writing XML to file');
		}
	}
}

module.exports = XmlFileService;
