const { convertURL } = require('../services/url_string_extraction');
const { TextFileService } = require('../services/file_creation/text_file_creation');
const dateService = require('../services/date-service');
const fileService = require('../services/file_service');
const fs = require('fs');
const sendToRemote = require('../services/remote/send_to_remote');
const fileExtensionService = require('../services/file_extension_service');
const pbnRemote = require('../services/pbn_remote');

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

async function handlePbnLinConversion(req, res, next) {
	try {
		// console.log('Request: ', req);

		const file = req.file;

		if (!file) {
			throw new Error('No file in body');
		}

		console.log('File detected: ', file);

		const filename = file.originalname;
		const formData = new FormData();
		const blob = new Blob([file.buffer], { type: file.mimetype });
		formData.append('filename', blob, filename);

		const headers = { 'Content-Type': 'multipart/form-data' };
		const payload = { formData, headers };

		const remoteResponse = await sendToRemote.uploadPbn(payload);
		const newExtension = 'lin';
		if (remoteResponse === 200) {
			console.log('Remote response: ', remoteResponse);
			console.log('Now attempting download');

			const newFilename = fileExtensionService.changeFileExtension(
				filename,
				newExtension
			);

			const linFile = await pbnRemote.downloadLinFile(newFilename);

			if (!linFile) {
				throw new Error('.lin file not found on remote servers');
			}

			res.setHeader('Content-Disposition', `attachment; filename=${newFilename}`);
			res.setHeader('Content-type', 'application/octet-stream');
			res.setHeader('X-Filename', newFilename);
			res.end(linFile);

			// console.log(linFile);
			// res.status(200).json({ linFile });
		}

		// console.log(remoteResponse);
	} catch (error) {
		next(error);
	}
}
module.exports = { handleLinExtraction, handlePbnLinConversion };
