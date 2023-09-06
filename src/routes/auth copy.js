const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const director = require('../models/director');
const fs = require('fs');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const path = require('path');
const checkAuth = require('../middleware/check-auth');
const jwt = require('jsonwebtoken');
const generateSlot = require('../controllers/slotCreation');
const errorResponse = require('../controllers/errorResponse');
dotenv.config();

const router = express.Router();

const saltChars =
	'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789$%^&*()-_+=~';

var salt = bcrypt.genSaltSync(10, { charset: saltChars });

// Keys
const keyPass = process.env.KEY_PASS;

const RSA_PRIVATE_KEY = fs.readFileSync(
	path.join(__dirname, '../../keys/private_key.pem')
);

const decryptedKey = crypto.createPrivateKey({
	key: RSA_PRIVATE_KEY,
	passphrase: keyPass
});

// create a new hashed password for testing

router.post('/test-password', async (req, res) => {
	const testPass = {
		username: req.body.username,
		plain_text_pass: req.body.password,
		hashed_password: bcrypt.hashSync(req.body.password, salt),
		salt: salt,
		rounds: 10
	};
	const textData = `username:${testPass.username}\nplain text password:${testPass.plain_text_pass}\nhashed password:${testPass.hashed_password}\nsalt:${testPass.salt}\nrounds: ${testPass.rounds}`;
	console.log(testPass);
	fs.writeFile('/backend/data/test_pass.txt', textData, err => {
		if (err) {
			console.error(err);
			res.status(500).send('Error writing file');
		} else {
			res.send('File written');
		}
	});
});

//Login

router.post('/login', (req, res, next) => {
	const { type, username, password } = req.body;
	console.log (req.body);
	// return
	let searchQuery = {};

	// console.log(req.body);
	// console.log('loginType:', type);
	// console.log('username:', username);
	// console.log('slot:', slot);
	// console.log('password:', password);

	if (type === 'slot') {
		searchQuery = { slot: username };
		console.log('slot: ', username)
	} else if (type === 'user_name') {
		console.log('user_name: ', username)
		searchQuery = { user_name: username };
	}
	console.log('loginType:', type);
	console.log('username:', username);
	console.log('searchQuery is: ', searchQuery);
	// return;
	director.findOne(searchQuery).then(result => {
		console.log(password,result.password)
		// return
		if (!result) {
			res.status(200).json({ status: 'ERRORNOUSER' });
			// return;
		}
		// console.log("bcrypt result is " + result, '\n', result.valid_user)

		if (
			// bcrypt.compareSync(req.body.password, result.password && result.valid_user)
			bcrypt.compareSync(password, result.password) &&
			result.valid_user
		) {
			const jwtBearerToken = jwt.sign({}, decryptedKey, {
				algorithm: 'RS256',
				expiresIn: '1h',
				subject: String(result.slot),
				allowInsecureKeySizes: true
			});
			if (!process.env.ALLOW_LOCAL_STORAGE) {
				res.cookie('SESSIONID', jwtBearerToken, {
					httpOnly: true,
					secure: true,
					maxAge: 3600000
				});
			}
			console.log(result.slot);
			console.log(result.slots);

			console.log('The returned "result" is:  ' + result);
			let slotsArray;
			let checkedSlot;
			if (typeof result.slots == 'undefined') {
				slotsArray = 'No slot array for this director';
				checkedSlot = result.slot;
			} else if (result.slots.length === 0 || result.slots.length > 0) {
				slotsArray = 'slot array property exists but it is empty';
				checkedSlot = result.slot;
			} else {
				slotsArray = result.slots;
			}

			const checkedDirector = {
				directorUsername: result.user_name || 'No Username Found',
				directorId: result._id,
				directorSlot: result.slot || 'No slot Found For Current Director',
				slotsArray: slotsArray || 'No slot array for this director'
			};

			console.log('checkedDirector object is: ', checkedDirector);

			res.status(200).json({
				status: 'LOGGEDIN',
				idToken: jwtBearerToken,
				expirest: 3600000,
				directorSlot: checkedDirector.directorSlot,
				directorId: checkedDirector.directorId,
				directorUsername: checkedDirector.directorUsername
			});
		} else {
			res.status(200).json({ status: 'ERRORPASS' });
		}
	});
});

//Logout (Clear Cookie)

router.get('/logout', checkAuth, (req, res, next) => {
	res.clearCookie('SESSIONID');
	res.sendStatus(200);
});

// Get Users
router.get('/', checkAuth, (req, res, next) => {
	director.find().then(result => {
		res.json({ users: result });
	});
});

//Create user

router.post('/', async (req, res, next) => {
	console.log(req.body.slot);
	let slot = '';
	if (!req.body.slot) {
		slot = generateSlot();
	} else slot = req.body.slot;
	const newSlot = {
		slot: slot
	};
	const oldSlot = req.body.slot;

	const hashedPassword = bcrypt.hashSync(req.body.password, salt);

	const newDirector = new director({
		full_name: req.body.full_name,
		user_name: req.body.user_name,
		type: req.body.type,
		valid_user: true,
		email: req.body.email,
		slot: oldSlot,
		slots: [newSlot],
		tel_phone: req.body.tel_phone,
		password: hashedPassword,
		country: req.body.country,
		userData: {
			addDate: req.body.userData.addDate,
			lastPlayed: req.body.userData.lastPlayed,
			pp_n: req.body.userData.pp_n
		}
	});
	newDirector
		.save()
		.then(result => {
			const jwtBearerToken = jwt.sign({}, decryptedKey, {
				algorithm: 'RS256',
				expiresIn: '1h',
				subject: result.slot,
				allowInsecureKeySizes: true
			});
			if (!process.env.ALLOW_LOCAL_STORAGE) {
				res.cookie('SESSIONID', jwtBearerToken, {
					httpOnly: true,
					secure: true,
					maxAge: 3600000,
					allowInsecureKeySizes: true
				});
			}

			res.status(200).json({
				message: 'DIRECTOR_CREATED',
				idToken: jwtBearerToken,
				expirest: 3600000,
				user: result,
				err: null
			});

			console.log(newDirector);

			// Stop the user from sending to Victor
			// return;

			const sendData = async () => {
				console.log('about to send to Victor');

				const transformedData = `trial\n${req.body.full_name}\n${req.body.email}\n${req.body.tel_phone}\n${req.body.slot}\n${req.body.country}\n${req.body.type},${hashedPassword}\n`;

				console.log(transformedData);
				// return;

				try {
					const headers = { 'Content-Type': 'text/plain' };
					const response = await axios.post(
						process.env.VICTOR_SERVER,
						transformedData,
						{
							headers: headers
						}
					);
					console.log(response.data);

					const lines = response.data.split();
					result = lines[0].trim().toLowerCase();
					if (result === 'success') {
						console.log("Success from Victor's Server");
					} else {
						throw new Error("Error from Victor's server");
					}
					// console.log(response);
				} catch (error) {
					console.log(error.message);
				}
			};
			sendData();
		})
		.catch(error => {
			console.log(error);
			res.json({ message: 'ERROR', err: error, user: null });
		});
});

//Delete user

router.delete('/', checkAuth, (req, res, next) => {
	var id = req.query.id;
	user
		.findOneAndDelete({ _id: id })
		.then(result => {
			res.json({ deletedDirector: result, err: null, message: 'Deleted director' });
		})
		.catch(error => {
			res.json({ deletedDirector: null, err: error, message: 'ERROR' });
		});
});

router.post('/check-username', (req, res, next) => {
	directorData.find({}, { user_name: 1, _id: 0 }).then(result => {
		var usernameArray = new Array();
		for (idx in result) {
			usernameArray.push(result[idx].user_name);
		}
		if (usernameArray.includes(req.body.name)) {
			res.json({ unique: false });
		} else {
			res.json({ unique: true });
		}
	});
});

// Update email route
router.put('/update-email', (req, res) => {
	const { directorId, email } = req.body;

	user
		.findByIdAndUpdate(directorId, { email }, { new: true })
		.then(updatedDirector => {
			if (!updatedDirector) {
				return res.status(404).json({ message: 'User not found' });
			}

			const config = {
				method
			};
			res
				.status(200)
				.json({ message: 'Email updated successfully', user: updatedDirector });
		})
		.catch(error => {
			res.status(500).json({ message: 'Failed to update email', error });
		});
});

// Update password route

router.put('/update-password', async (req, res) => {
	try {
		const { directorId, currentPassword, password, slot } = req.body;
		const hashedPassword = bcrypt.hashSync(password, salt);

		const sendData = async () => {
			const url = process.env.UPDATE_PASS;
			const string = `${slot}\nDIRPASS\n${currentPassword}\n${hashedPassword}`;
			console.log(url, '\n', string);

			try {
				const headers = { 'Content-Type': 'text/plain' };
				const response = await axios.post(url, string, {
					headers: headers
				});
				console.log('response: ', response.data);
				const lines = response.data.split();
				result = lines[0].trim().toLowerCase();
				if (result === 'success') {
					console.log("Success from Victor's Server");
				} else {
					throw new Error("Error from Victor's server");
				}

				updateDatabase();
			} catch (err) {
				console.error('Failed to send data', err);
				return res.status(500).json({ message: 'Failed to send data to victor' });
			}
		};

		const updateDatabase = () => {
			director
				.findByIdAndUpdate(directorId, { password: hashedPassword }, { new: true })
				.then(updatedDirector => {
					if (!updatedDirector) {
						return res.status(400).json({ message: 'User Not Found' });
					}
					res.status(200).json({
						message: 'Password updated Successfully',
						user: updatedDirector
					});
				})
				.catch(err => {
					console.error('Failed to update database: ', err);
					res.status(500).json({ message: 'Failed to update Password' });
				});
		};

		sendData();
	} catch (err) {
		res.status(500).json({ message: 'Internal Server Error' });
	}
});

router.put('/addiional-slot', checkAuth, async (req, res, next) => {
	try {
		if (!req.query.id) {
			return res.status(400).json({ message: 'No ID in request' });
		}

		if (!req.query.additSlot) {
			return res.status(400).json({ message: 'No additSlot in request' });
		}

		res
			.status(200)
			.json({ message: `new slot: ${additSlot} added to account ID ${id}` });
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'Internal Server Error' });
	}
});

const newDir = () => {
	newDirector.save().then(result => {
		const jwtBearerToken = jwt.sign({}, decryptedKey, {
			algorithm: 'RS256',
			expiresIn: '1h',
			subject: result.slot,
			allowInsecureKeySizes: true
		});
		if (!process.env.ALLOW_LOCAL_STORAGE) {
			res.cookie('SESSIONID', jwtBearerToken, {
				httpOnly: true,
				secure: true,
				maxAge: 3600000,
				user: result,
				err: null
			});
		}
	});
};

module.exports = router;
