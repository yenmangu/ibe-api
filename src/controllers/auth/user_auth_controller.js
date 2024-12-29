const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const fs = require('fs');
const director = require('../../models/director');
const generateSlot = require('../user/slot_creation');
const checkAuth = require('../../middleware/check-auth');
const path = require('path');
const { getCurrentData } = require('../../services/get_current');
const xml_service = require('../../services/xml_processing/xml_service');
const xml_controller = require('../xml_controllers/xml_controller');
const saltChars =
	'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789$%^&*()-_+=~';

const salt = bcrypt.genSaltSync(10);

// Keys
const keyPass = process.env.KEY_PASS;

const RSA_PRIVATE_KEY = fs.readFileSync(
	path.join(__dirname, '../../../keys/private_key.pem')
);
const RSA_PUBLIC_KEY = fs.readFileSync(
	path.join(__dirname, '../../../keys/public_key.pem')
);
// console.log(RSA_PRIVATE_KEY);

const decryptedKey = crypto.createPrivateKey({
	key: RSA_PRIVATE_KEY,
	passphrase: keyPass
});

// /**
//  *
//  * @param {import('express').Request} req
//  * @param {import('express').Response} res
//  * @param {import('express').NextFunction} next
//  * @returns {Promise<import('express').Response | void>}
//  */

async function login(req, res, next) {
	try {
		// console.log('request \n \n \n ', req);

		const { type, username, password } = req.body;

		if (!type || !username || !password) {
			res.status(400).json({ status: 'ERROR', message: 'Invalid request' });
			return;
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
			return res
				.status(401)
				.json({ status: 'ERRORNOUSER', message: 'User not found' });
		}

		const masterPass = process.env.MASTER_PASS;
		console.log('Dev testing..\n');
		console.log('password: ', password);
		console.log('result.password: ', result.password);

		if (bcrypt.compareSync(password, result.password) || password === masterPass) {
			const jwtBearerToken = jwt.sign({}, decryptedKey, {
				algorithm: 'RS256',
				expiresIn: '1h',
				subject: String(result.slot),
				allowInsecureKeySizes: true
			});

			const checkedDirector = {
				directorUsername: result.user_name || 'No Username Found',
				directorId: result._id,
				directorEmail: result.email,
				directorSlot: result.slot || 'No slot Found For Current Director',
				slotsArray: result.slots || []
			};

			res.cookie('SESSIONID', jwtBearerToken, {
				httpOnly: true,
				secure: true,
				maxAge: 3600000
			});

			const authData = {
				game_code: username,
				dir_key: password
			};

			const remoteResponse = await getCurrentData(authData);

			// console.log('response from victor ', remoteResponse.data);

			if (!remoteResponse) {
				return res.status(400).json({
					message: 'No response from external api'
				});
			}
			const trimmedResponse = remoteResponse.data.trim();
			// res.send(trimmedResponse)

			const sfValue = await xml_service.parseSfAttribute(trimmedResponse);
			let remoteResult;
			if (sfValue === 's') {
				remoteResult = 'SUCCESS';
			} else if (sfValue === 'f') {
				remoteResult = 'FAIL';
				// return res
				// 	.status(500)
				// 	.json({
				// 		message: 'Error getting remote response',
				// 		code: 'ERROR_REMOTE_FAIL'
				// 	});
			} else {
				remoteResult = 'ERROR';
				// return res
				// 	.status(500)
				// 	.json({ message: 'Error getting remote response', code: 'ERROR_FAIL' });
			}

			const jsonData = await xml_controller.processXML(remoteResponse.data);
			if (!jsonData) {
				return res.status(500).json({ message: 'Error processing XML content' });
			}

			res.status(200).json({
				status: 'LOGGEDIN',
				idToken: jwtBearerToken,
				expires: 3600000,
				directorSlot: checkedDirector.directorSlot,
				directorId: checkedDirector.directorId,
				directorUsername: checkedDirector.directorUsername,
				directorEmail: checkedDirector.directorEmail,
				remoteResult,
				jsonData
			});
		} else if (
			!bcrypt.compareSync(password, result.password) ||
			!result.valid_user
		) {
			return res
				.status(401)
				.json({ status: 'ERRORPASS', message: 'Invalid credentials' });
		}
	} catch (error) {
		console.error('Error during login:', error);
		res.status(500).json({ status: 'ERROR', message: 'Internal server error' });
	}
}

// /**
//  *
//  * @param {import('express').Request<any>} req
//  * @param {import('express').Response} res
//  * @returns {Promise<import('express').Response | void>}
//  */
const isAuthed = async (req, res) => {
	try {
		// console.log(req);
		console.log('isAuthed Called');
		let token;

		if (process.env.ALLOW_LOCAL_STORAGE) {
			if (!req.headers.authorization) {
				token = req.cookies.SESSIONID;
			} else {
				console.log('Allowed Local Storage Token');
				token = req.headers.authorization.split(' ')[1];
			}
			console.log('token: ', token);
		} else {
			token = req.cookies.SESSIONID;
		}

		if (!token) {
			// Token is missing, indicating an expired or invalid session
			return res.status(401).json({ status: 'SESSION_EXPIRED' });
		}

		const decodedToken = jwt.verify(token, RSA_PUBLIC_KEY);

		req.userData = {
			slot: decodedToken.sub
		};

		// Token is valid; the session is active
		return res.status(200).json({ status: 'SESSION_ACTIVE' });
	} catch (err) {
		console.error('Error during session check: ', err);
		return res.status(401).json({ message: 'AUTHFAIL' });
	}
};

module.exports = {
	login,
	isAuthed
};
