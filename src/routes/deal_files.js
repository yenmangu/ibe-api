const express = require('express');
require('dotenv').config();

const handleFile = require('../controllers/data/file_controller.js');
const sendToRemote = require('../controllers/send_to_remote.js');
const { multerMiddleware } = require('../controllers/data/file_controller.js');

const router = express.Router();

router.post('/bbo', multerMiddleware, sendToRemote.uploadBBO);

router.post('/usebio', multerMiddleware, sendToRemote.uploadUSEBIO);

router.post('/hands', multerMiddleware, sendToRemote.uploadHandConfig);

module.exports = router;
