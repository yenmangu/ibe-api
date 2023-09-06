const util = require('util');
const multer = require('multer');
const path = require('path');
const maxSize = 2 * 1024 * 1024;
const fileLimit = 20 * 1024 * 1024;
const fieldSize = 8 * 1024 * 1024;

const __basedir = path.join(__dirname, './uploads');

const uploadFiles = () => {
	const storage = multer.diskStorage({
		destination: (req, file, callback) => {
			callback(null, __basedir + '/uploads');
		},
		filename: (req, file, callback) => {
			console.log(file.originalname);
			callback(null, file.originalname);
		}
	});

	const upload = multer({
		storage: storage,
		limits: { fileSize: maxSize, fieldSize: fieldSize, files: fileLimit }
	}).array('upload', 30);

	return (req, res) =>
		new Promise((resolve, reject) => {
			upload(req, res, err => {
				if (err) {
					reject(err);
				} else {
					resolve();
				}
			});
		});
};

// const getFormData = async (req, res) => {
// 	try {
// 		await uploadFiles(req, res);
// 		if (!req.files) {
// 			console.log('no files detected in "getFormData function"');
// 			return null;
// 		} else {
// 			const formData = new FormData();
// 			req.files.forEach(file =>
// 				formData.append('upload', file.buffer, file.originalname)
// 			);
// 			return formData;
// 		}
// 	} catch (err) {
// 		console.error(err);
// 		throw err;
// 	}
// };
module.exports = {
	uploadFiles,
	// getFormData
};
