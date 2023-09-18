const express = require('express');
const app = express();
const router = express.Router();
const dotenv = require('dotenv').config();
const linSheetsController = require('../controllers/google_controllers/lin_sheets_controller');

router.get('/', (req, res) => {
	res.status(200).send('Success');
});

router.get('/test', (req, res) => {
	res.status(200).send('webhook-received ');
});

router.post('/googlesheet', (req, res) => {
	console.log(req.body);
	res.status(200).send('googlesheet-webhook-received ');
});

router.post('/sending-data', async (req, res) => {
	linSheetsController.addData(req, res);
	res.status(200).send('Success Adding Data');
	console.log('Success adding data');
});

module.exports = router;
