const express = require('express');
const dotenv = require('dotenv');
const FormData = require('form-data');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const event = require('../models/events');
const multer = require('multer');
const rimraf = require('rimraf');
const xmlFormat = require('xml-formatter');
const checkAuth = require('../middleware/check-auth');
dotenv.config();

const router = express.Router();

router.get('/getEBU', (req, res, next) => {
	let data = `${req.query.club_name}\r\n${req.query.club_id}\r\n${req.query.event_name}\r\n${req.query.charge_code}\r\n${req.query.use_master}\r\n${req.query.master_color}\r\n${req.query.master_scale}\r\n${req.query.td_name}\r\n${req.query.td_email}\r\n\r\n${req.query.use_master_perMatch}`;

	// Pianola End Point
	let config = {
		method: 'post',
		maxBodyLength: Infinity,
		url: `https://brianbridge.net/cgi-bin/brian2getfile.cgi?SLOT=${req.query.slot}&TYPE=EBUP2PXML&NOWRAP=TRUE`,
		headers: {
			'Content-Type': 'application/xml'
		},
		data: data
	};

	axios
		.request(config)
		.then(response => {
			res.send(response.data);
		})
		.catch(error => {
			console.log(req.query);
		});
});

router.get('/getDeal', (req, res, next) => {
	let config = {
		method: 'get',
		maxBodyLength: Infinity,
		url: `https://www.brianbridge.net/cgi-bin/brian2getfile.cgi?SLOT=${req.query.slot}&TYPE=EBUP2PXML&NOWRAP=TRUE`,
		headers: {}
	};

	axios
		.request(config)
		.then(response => {
			res.send(response.data);
		})
		.catch(error => {
			console.log(error);
		});
});
// .pbn, .dlm, .dup
//  .lin - ignore lin
const upload = multer({ dest: 'uploads' });
router.post('/uploadDeal', upload.single('file'), (req, res) => {
	console.log(req.file);
	const originalUploaded = req.file;

	var uploadFile = fs.createReadStream(
		path.join(__dirname, '../', '../', 'uploads', req.file.filename)
  );
  let data = new FormData();
	data.append('name', 'diasel');
	data.append('upload', uploadFile);
	console.log();
	let config = {
		method: 'get',
		maxBodyLength: Infinity,
		url:
			'https://www.brianbridge.net/cgi-bin/brian2puthandrecordxml.cgi?SLOT=' +
			req.body.slot,
		headers: {
			...data.getHeaders()
		},
		data: data
	};
	res.status(200).json({ message: 'File uploaded successfully' });
});


router.post('/delete-hand',checkAuth, async (req,res)=> {
	try {

		if (!req.query.slot) {
			return res.status(400).json({message: 'No slot in query'})
		}
		const slot = req.query.slot;
		const urlQuery = `${process.env.PIANOLA}?SLOT=${slot}`
		const config = {
			method: 'post',
			maxBodyLength: Infinity,
			url: urlQuery,
		}
		const response = await axios(config);
		const responseData = response.data

		if (response.status !== 200) {
      res.status(response.status).json({ message: `The brianBridge DelHand request failed due to: ${responseData}` });
    } else {
      res.status(200).json({ message: 'DelHand request success' });
    }
	} catch (err) {
		console.error(err);
		return res.status(500).json({message: 'Internal Server Error'})
	}
})





module.exports = router;
