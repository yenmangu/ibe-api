const fs = require('fs').promises;
const path = require('path');

class CsvFileService {
	static async saveCsvToFile(CSVData) {
		try {
			const filePath = path.resolve(
				path.join(__dirname, '..', '..', 'temp', 'response.csv')
			);
			console.log('CSV Filepath: ', filePath);
			await fs.writeFile(filePath, CSVData);
			return filePath;
		} catch (error) {
			throw new Error('Error writing CSV to file');
		}
	}
}


module.exports = CsvFileService;
