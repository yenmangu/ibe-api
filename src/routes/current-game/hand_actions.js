const express = require('express');
const handActions = require('../../controllers/hand_actions/hand_actions_controller');
const fileMiddleware = require('../../middleware/file');

const router = express.Router();
// router.get('/download',handActions.handleDownload)
router.post('/movement-pdf', handActions.handleHtmlPdf);

router.post('/masterpoints');
router.post('/ebu');

router.post('/html-pdf', handActions.handleHtmlPdf);

router.get('/delete-hand', handActions.handleDeleteHand);

router.post(
	'/upload',
	fileMiddleware.handleMultipleFileUpload,
	handActions.handleUpload
);

router.get('/download-hand', handActions.handleDownload);

module.exports = router;
