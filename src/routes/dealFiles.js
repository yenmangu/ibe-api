const express = require('express');
require('dotenv').config();

const handleFile = require('../controllers/file.controller');
const sendToRemote = require('../controllers/sendToRemote');

const router = express.Router();

router.post('/bbo', handleFile.multerMiddleware, sendToRemote.uploadBBO);

router.post('/usebio', handleFile.multerMiddleware, sendToRemote.uploadUSEBIO);

router.post('/hands', handleFile.multerMiddleware, sendToRemote.uploadHandConfig)

// router.post('/', checkAuth, async (req, res, next) => {
// 	try {
// 		// console.log('queryis: ',req.query);
// 		// console.log('params: ',req.params);
// 		// return
// 		if (!req.query.slot) {
// 			return res.status(400).json({ message: 'No SLOT account detected' });
// 		}
// 		const encodeSlot = req.query.slot;
// 		const decodeSlot = decodeURIComponent(encodeSlot);
// 		const urlquery = `?SLOT=${decodeSlot}`;
// 		console.log('urlquery is:  ' + urlquery);
// 		console.log(req.files? req.files : 'no files')
// 		// console.log(JSON.stringify(req.body));
// 		// return
// 		if (!req.body.data) {
// 			console.log(req.body ? req.body : 'no body');
// 			return res.status(400).json({ message: 'No File Detected' });
// 		} else {
// 			const data = req.body;

// 			console.log('formData is ' + data);
// 			const config = {
// 				method: 'post',
// 				url: `${process.env.BBO_UPLOAD}${urlquery}`,
// 				headers: {
// 					'Content-Type': 'application/xml'
// 				},
// 				data: data
// 			};
// 			console.log(config.url);

// 			const response = await axios(config);
// 			console.log(response.data);
// 			res
// 				.status(response.status)
// 				.json({ message: 'BBO Success', response: response.data });
// 		}
// 	} catch (err) {
// 		console.error(err);
// 		res.status(500).json({ message: 'Internal Server Error' });
// 	}
// });

module.exports = router;
