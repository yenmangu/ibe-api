const express = require('express');
const router = express.Router();
const fileMiddleware = require('../../middleware/file');

router.post('/single', fileMiddleware.handleSingleFileUpload);
router.post('/multiple', fileMiddleware.handleMultipleFileUpload);

module.exports = router;
