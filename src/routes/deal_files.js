const express = require('express');
require('dotenv').config();

const handleFile = require('../controllers/data/file_controller');
const sendToRemote = require('../controllers/send_to_remote');

const router = express.Router();

router.post('/bbo', handleFile.multerMiddleware, sendToRemote.uploadBBO);

router.post('/usebio', handleFile.multerMiddleware, sendToRemote.uploadUSEBIO);

router.post('/hands', handleFile.multerMiddleware, sendToRemote.uploadHandConfig);

module.exports = router;
