const multer = require('multer');
const fileExtensionController = require('../controllers/file_controllers');
const CustomError = require('../services/error/error');

const clientError = new CustomError();
clientError.message = 'Client Error - No files provided';
clientError.status = 400;

const storage = multer.memoryStorage();

// 'file' for single
// 'files' for multiple

const singleUpload = multer({ storage: storage }).single('file');
const multiUpload = multer({ storage: storage }).array('files');

async function handleSingleFileUpload(req, res, next) {
	console.log('handle file upload middleware invoked');

	try {
		if (!req.gameode || req.dirkey) {
			return res.status(400).json({ message: '' });
		}
		if (req.file) {
			console.log('there is a req.file');
		}
		singleUpload(req, res, async err => {
			if (err instanceof multer.MulterError) {
				return next(err);
			} else if (err) {
				return next(err);
			}
			if (req.file) {
				console.log('uploaded single file: ', req.file);
				fileExtensionController.checkFileExtension(req, res, async error => {
					if (error) {
						return next(error);
					}
				});
				next();
			}
		});
	} catch (error) {
		next(error);
	}
}

async function handleBBO(req, res, next) {
	console.log('handle BBO upload invoked');
	try {
		await new Promise((resolve, reject) => {
			multiUpload(req, res, async err => {
				if (err instanceof multer.MulterError) {
					return reject(err);
				} else if (err) {
					return reject(err);
				}
				if (req.files && req.files.length > 0) {
					resolve(req.files);
				}
			});
		});
	} catch (error) {
		next(error);
	}
	next();
}

async function handleUSEBIO(req, res, next) {
	try {
		console.log('usebio multer');

		await new Promise((resolve, reject) => {
			console.log('promise made');

			singleUpload(req, res, async err => {
				if (err instanceof multer.MulterError) {
					console.error('multer error handling file');
					return reject(err);
				} else if (err) {
					console.error('error handling file');
					return reject(err);
				}
				if (req.file) {
					console.log('req.file exists');
					resolve(req.file);
				}
			});
		});
	} catch (error) {
		next(error);
	}
	next();
}

async function handleMultipleFileUpload(req, res, next) {
	console.log('multiple file upload middleware invoked');

	try {
		await new Promise((resolve, reject) => {
			multiUpload(req, res, async err => {
				if (err instanceof multer.MulterError) {
					return reject(err);
				} else if (err) {
					return reject(err);
				}
				if (req.files && req.files.length > 0) {
					console.log(req.files);
					await fileExtensionController.checkFileExtension(
						req,
						res,
						async error => {
							if (error) {
								return reject(error);
							}
							resolve(true);
						}
					);
				} else {
					reject(new Error('No files uploaded'));
				}
			});
		});
	} catch (error) {
		next(error);
	}
	next();
}

async function handlePbnUpload(req, res, next) {
	try {
		console.log('Pbn file upload invoked');
		await new Promise((resolve, reject) => {
			singleUpload(req, res, async err => {
				if (err instanceof multer.MulterError) {
					return reject(err);
				} else if (err) {
					return reject(err);
				}
				if (req.file) {
					console.log(req.file.originalname);
					const file = req.file.originalname;
					const extension = file.substring(file.lastIndexOf('.'));
					console.log('Extension of file: ', extension);

					if (extension !== '.pbn' && extension !== '.PBN') {
						reject(new Error('File not .pbn format'));
					} else {
						resolve(true);
					}
				} else {
					reject(new Error('No file uploaded'));
				}
			});
		});
	} catch (error) {
		next(error);
	}
	next();
}

module.exports = {
	handleSingleFileUpload,
	handleMultipleFileUpload,
	handleBBO,
	handleUSEBIO,
	handlePbnUpload
};
