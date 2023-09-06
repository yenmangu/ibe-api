const express = require('express');
const dotenv = require('dotenv');
const axios = require('axios');
const event = require('../models/events');
const checkAuth = require('../middleware/check-auth');
const director = require('../models/director');
dotenv.config();

const router = express.Router();

router.get('/', checkAuth, (req, res, next) => {
	var query = {};
	if (req.query.current) {
		query = {
			date_ended: ''
		};
	}
	event.find(query).then(result => {
		if (req.query.historic) {
			var newArray = new Array();
			for (idx in result) {
				if (result[idx].date_ended != '') {
					newArray.push(result[idx]);
				}
			}
			res.json({ events: newArray });
		} else {
			res.json({ events: result });
		}
	});
});

router.post('/analyse', async (req, res) => {
	try {
		const { email, user_name, slot } = req.body;

		const requiredFields = Object.keys(req.body);
		const missingFields = [];
		for (const field of requiredFields) {
			if (!req.body[field]) {
				missingFields.push(field);
			}
		}

		if (missingFields.length > 0) {
			return res
				.status(400)
				.json({ message: 'bad request. missing fields', missingFields });
		}
		const filter = { email, user_name };
		console.log(filter);
		const returnedHash = await director.findOne(filter).select('password');
		if (!returnedHash) {
			return res.status(404).json({
				message: 'Error, No director found with that email and username combination'
			});
		}
		let payload = '';
		payload = `${slot}\nDIRPASS\n${returnedHash.password}`;
		console.log(payload);
		// return;

		const config = {
			method: 'post',
			url: `${process.env.ANALYSE}`,
			data: payload
		};

		const errCodes = ['nopass','susp','wrongpass','unkerr'];


		const response = await axios(config);
		if (!response) {
			return res.status(404).json({ message: 'No analysis found' });
		}
    
		console.log(response.data);
		res
			.status(response.status)
			.json({ message: 'Success accessing analysis', response: response.data });
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'Internal Server Error' });
	}
});

module.exports = router;
