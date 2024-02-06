const express = require('express');
const app = express();
const router = express.Router();
const dotenv = require('dotenv').config();
const webhookValidation = require('../middleware/webhook_validation');
const processPayload = require('../services/webhook_payload');
const linSheetsController = require('../controllers/google_controllers/lin_sheets_controller');
const webhookController = require('../controllers/webhook_controller');
const validateContent = require('../middleware/validate_content_type');

const secretToken = process.env.WEBHOOK_TOKEN;

const validateJSONType = validateContent.validateContentType('application/json');

router.get('/', (req, res) => {
	res.status(200).send('Success');
});

router.get('/test', (req, res) => {
	res.status(200).send('webhook-received ');
});

router.post(
	'/googlesheet',
	webhookValidation.validateRequest,
	validateJSONType,

	webhookController.handlePaymaticWebhook
);

// router.post('/googlesheet', (req, res) => {
// 	console.log(req.body);
// 	console.log(secretToken);
// 	res.status(200).send('googlesheet-webhook-received ');
// });

router.post('/sending-data', async (req, res) => {
	linSheetsController.addData(req, res);
	res.status(200).send('Success Adding Data');
	console.log('Success adding data');
});

router.get(
	'/bulk-convert',
	webhookValidation.validateRequest,
	webhookController.handleBulkConvert
);

module.exports = router;
