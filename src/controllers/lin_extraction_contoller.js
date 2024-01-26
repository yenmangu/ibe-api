const { convertURL } = require('../services/url_string_extraction');
const { TextFileService } = require('../services/file_creation/text_file_creation');
const dateService = require('../services/date-service');
const fs = require('fs');

async function handleLinExtraction(req, res, next) {
	try {
		const urlArray = req.body;
		// console.log(urlArray);
		const extractedArray = [];
		urlArray.forEach((urlObject, index) => {
			// console.log('urlString: ', urlObject);

			const extractedString = convertURL(urlObject.url);
			const object = { extracted: extractedString };
			extractedArray.push(object);
		});

		console.log('Extracted Array: ', extractedArray);
		const filePath = await TextFileService.saveLinDataToFile(extractedArray);
		const formattedDate = dateService.todaysDate();
		const fileName = `${formattedDate}-extracted-lin-strings`;
		console.log('Filename: ', fileName);

		res.setHeader('Content-Type', 'text/plain');
		res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
		const fileStream = await fs.createReadStream(filePath);
		fileStream.pipe(res);
		res.on('close', () => {
			fs.unlink(filePath, error => {
				if (error) {
					console.error('Error deleting file: ', error);
					throw error;
				}
			});
		});
	} catch (error) {
		next(error);
	}
}
module.exports = { handleLinExtraction };
