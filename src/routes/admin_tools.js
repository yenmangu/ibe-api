const express = require('express');
const { handleLinExtraction } = require('../controllers/lin_extraction_contoller');
const router = express.Router();

router.post('/extract-lin', handleLinExtraction);

module.exports = router;
