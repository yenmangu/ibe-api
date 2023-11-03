const fileExtensionService = require('../services/file_extension');


const clientError = new Error();
clientError.message = 'Invalid file';
clientError.status = 400;

async function checkFileExtension(req, res, next) {
	try {
		if (req.file || req.files) {
			if (req.files) {
				const fileList = req.files.map(file => file.originalname);
				for (const file of fileList) {
					const fileExtension = file.substring(file.lastIndexOf('.'));
					if (!fileExtensionService.isValidExtensionLin(fileExtension)) {
						return res
							.status(clientError.status)
							.json({ message: clientError.message });
					}
				}
			}

			const fileName = req.file.originalname;
			const fileExtension = fileName.substring(fileName.lastIndexOf('.'));

			if (fileExtensionService.isValidExtension(fileExtension)) {
				// return res.status(200).json({ message: 'Correct file type received' });

			} else {
				return res
					.status(clientError.status)
					.json({ message: clientError.message });
			}
		} else {
			return next(new Error('no file or files provided'));
		}
	} catch (error) {
		next(error);
	}
}

module.exports = {
	checkFileExtension
};
