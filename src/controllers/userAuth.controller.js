const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const fs = require('fs');
const director = require('../models/director')
const generateSlot = require('./slotCreation');
const checkAuth = require('../middleware/check-auth');
const path = require('path');


const saltChars =
	'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789$%^&*()-_+=~';

const salt = bcrypt.genSaltSync(10, { charset: saltChars });

// Keys
const keyPass = process.env.KEY_PASS;

const RSA_PRIVATE_KEY = fs.readFileSync(
	path.join(__dirname, '../../keys/private_key.pem')
);

// console.log(RSA_PRIVATE_KEY);

const decryptedKey = crypto.createPrivateKey({
	key: RSA_PRIVATE_KEY,
	passphrase: keyPass
});



const login = async (req, res, next) => {
	try {
		const { type, username, password } = req.body;

		if (!type || !username || !password) {
			return res.status(400).json({ status: 'ERROR', message: 'Invalid request' });
		}

		let searchQuery = {};

		if (type === 'slot') {
			searchQuery = { slot: username };
		} else if (type === 'user_name') {
			searchQuery = { user_name: username };
		} else {
			return res
				.status(400)
				.json({ status: 'ERROR', message: 'Invalid login type' });
		}

		const result = await director.findOne(searchQuery);
		console.log(result);
		// return

		if (!result) {
			return res.status(401).json({ status: 'ERRORNOUSER', message: 'User not found' });
		}

		if (!bcrypt.compareSync(password, result.password) || !result.valid_user) {

			return res
				.status(401)
				.json({ status: 'ERRORPASS', message: 'Invalid credentials' });
		}

		const jwtBearerToken = jwt.sign({}, decryptedKey, {
			algorithm: 'RS256',
			expiresIn: '1h',
			subject: String(result.slot),
			allowInsecureKeySizes: true
		});

		const checkedDirector = {
			directorUsername: result.user_name || 'No Username Found',
			directorId: result._id,
			directorSlot: result.slot || 'No slot Found For Current Director',
			slotsArray: result.slots || []
		};

		res.cookie('SESSIONID', jwtBearerToken, {
			httpOnly: true,
			secure: true,
			maxAge: 3600000
		});

		res.status(200).json({
			status: 'LOGGEDIN',
			idToken: jwtBearerToken,
			expires: 3600000,
			directorSlot: checkedDirector.directorSlot,
			directorId: checkedDirector.directorId,
			directorUsername: checkedDirector.directorUsername
		});
	} catch (error) {
		console.error('Error during login:', error);
		res.status(500).json({ status: 'ERROR', message: 'Internal server error' });
	}
};

module.exports = {
	login
};
