const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const director = require('../models/director');
const fs = require('fs');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
var salt = bcrypt.genSaltSync(10);
const path = require('path');
const checkAuth = require('../middleware/check-auth');
const jwt = require('jsonwebtoken');
dotenv.config();

const router = express.Router();

// Keys
const keyPass = process.env.KEY_PASS;

const RSA_PRIVATE_KEY = fs.readFileSync(
	path.join(__dirname, '../../keys/private_key.pem')
);

const decryptedKey = crypto.createPrivateKey({
	key: RSA_PRIVATE_KEY,
	passphrase: keyPass
});

const testUserCreation = async (req, res) => {
	// console.log(req);
	for (let i = 0; i < 100; i++) {
		const newDirector = new director({
			full_name: `${req.body.full_name}${i}`,
			user_name: `${req.body.user_name}${i}`,
			type: 'admin',
			valid_user: true,
			email: `testUser${i}@test-mail${i}.com`,
			slot: `${req.body.slot}${i}`,
			tel_phone: `${req.body.tel_phone}${i}`,
			password: bcrypt.hashSync(`${req.body.password}${i}`, salt),
			country: req.body.country,
			type: req.body.type,
			userData: {
				addDate: new Date().getTime
				// lastPlayed: req.body.userData.lastPlayed,
				// pp_n: req.body.userData.pp_n
			}
		});
		newDirector.save();
	}
};

router.post('/create-test-users', async (req, res) => {
	try {
		for (let i = 0; i < 100; i++) {
			const newDirector = new user({
				full_name: `${req.body.full_name}${i}`,
				user_name: `${req.body.user_name}${i}`,
				type: 'admin',
				valid_user: true,
				email: `testUser${i}@test-mail${i}.com`,
				slot: `${req.body.slot}${i}`,
				tel_phone: `${req.body.tel_phone}${i}`,
				password: bcrypt.hashSync(`${req.body.password}${i}`, salt),
				country: req.body.country,
				type: req.body.type,
				userData: {
					addDate: new Date().getTime
					// lastPlayed: req.body.userData.lastPlayed,
					// pp_n: req.body.userData.pp_n
				}
			});
			newDirector.save();
		}
		res.status(200).json({
			message: 'SUCCESS',
			data: {}
		});
	} catch (err) {
		console.log(err);
		res.status(500).json({
			message: 'ERROR',
			error: err.message
		});
	}
});

module.exports = router;
