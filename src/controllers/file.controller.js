const multer = require('multer');
const path = require('path');

const memoryStorage = multer.memoryStorage();
const passFileToController = multer({ storage: memoryStorage });

const multerMiddleware = passFileToController.any();

module.exports = {
	// handleFile,
	multerMiddleware
};

