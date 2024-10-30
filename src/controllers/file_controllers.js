const { CustomError } = require('../services/error/Error');
const fileExtensionService = require('../services/file_extension');

const clientError = new CustomError();
clientError.message = 'Invalid file';
clientError.status = 400;

async function checkFileExtension(req, res, next) {
	try {
		if (req.files) {
			let fileExtensionValid = true;
			let fileTypeDetected = '';
			if (req.files.length > 1) {
				const fileList = req.files.map(file => file.originalname);
				for (const file of fileList) {
					const fileExtension = file.substring(file.lastIndexOf('.'));
					if (!fileExtensionService.isValidExtensionLin(fileExtension)) {
						fileExtensionValid = false;
						break;
					}
				}
			} else {
				const fileList = req.files.map(file => file.originalname);
				for (const file of fileList) {
					const fileExtension = file.substring(file.lastIndexOf('.'));
					if (!fileExtensionService.isValidExtension(fileExtension)) {
						fileExtensionValid = false;
						break;
					}
				}
			}
			if (!fileExtensionValid) {
				return res
					.status(clientError.status)
					.json({ message: clientError.message });
			}
			req.fileExtensionValid = fileExtensionValid;
		} else {
			return next(new Error('no file or files provided'));
		}
		next();
	} catch (error) {
		next(error);
	}
}

module.exports = {
	checkFileExtension
};
