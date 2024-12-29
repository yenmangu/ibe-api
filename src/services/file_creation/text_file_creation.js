const fs = require('fs').promises;
const path = require('path');

class TextFileService {
	static async saveLinDataToFile(extractedArray) {
		try {
			const filePath = path.resolve(
				path.join(__dirname, '..', '..', 'temp', 'response.txt')
			);

			const data = extractedArray
				.map((item, index) => {
					return `${index + 1}.\n${item.extracted}\n\n`;
				})
				.join('');

			await fs.writeFile(filePath, data);
			return filePath;
		} catch (error) {
			throw new Error('Error writing data to file');
		}
	}
}

class PbnFileService {
	static async savePbnFile(file) {}
}
module.exports = { TextFileService };
