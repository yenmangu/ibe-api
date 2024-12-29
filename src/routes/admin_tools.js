const express = require('express');
const uploadMiddleware = require('../middleware/file.js');
const linPbnController = require('../controllers/lin_pbn_controller');
const router = express.Router();

router.post('/extract-lin', linPbnController.handleLinExtraction);

router.post(
	'/convert-pbn',
	uploadMiddleware.handlePbnUpload,
	linPbnController.handlePbnLinConversion
);

module.exports = router;
