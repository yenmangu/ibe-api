const fs = require('fs').promises;
const path = require('path');

const dev_dir = path.resolve(__dirname, '../../dev_data/xml');

async function readFileAsync(filePath, encoding) {
	try {
		const content = await fs.readFile(filePath, encoding);
		return content;
	} catch (err) {
		throw err;
	}
}

async function writeFileAsync(filePath, data, encoding) {
	try {
		if (!filePath) {
			throw new Error('No file path provided to write file');
		}
		if (!data) {
			throw new Error('No data to write to file');
		}
		if (!encoding) {
			throw new Error('No encoding provided');
		}
		await fs.writeFile(filePath, data, encoding);
		return true;
	} catch (err) {
		console.error('Error writing file: ', err);
		return false;
	}
}

module.exports = { readFileAsync, writeFileAsync };
