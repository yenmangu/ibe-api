// const express = require('express');
// const axios = require('axios');
// const dotenv = require('dotenv');
// const user = require('../models/user');
// const fs = require('fs');
// const crypto = require('crypto');
// const bcrypt = require('bcryptjs');
// var salt = bcrypt.genSaltSync(10);
// const path = require('path');
// const checkAuth = require('../middleware/check-auth');
// const jwt = require('jsonwebtoken');
// dotenv.config();

// const router = express.Router();

// // Keys
// const keyPass = process.env.KEY_PASS;

// const RSA_PRIVATE_KEY = fs.readFileSync(
// 	path.join(__dirname, '../../keys/private_key.pem')
// );

// const decryptedKey = crypto.createPrivateKey({
// 	key: RSA_PRIVATE_KEY,
// 	passphrase: keyPass
// });

// // create a new hashed password for testing

// router.post('/test-password', async (req, res) => {
// 	const testPass = {
// 		username: req.body.username,
// 		plain_text_pass: req.body.password,
// 		hashed_password: bcrypt.hashSync(req.body.password, salt),
// 		salt: salt,
// 		rounds: 10
// 	};
// 	const textData = `username:${testPass.username}\nplain text password:${testPass.plain_text_pass}\nhashed password:${testPass.hashed_password}\nsalt:${testPass.salt}\nrounds: ${testPass.rounds}`;
// 	console.log(testPass);
// 	fs.writeFile('/backend/data/test_pass.txt', textData, err => {
// 		if (err) {
// 			console.error(err);
// 			res.status(500).send('Error writing file');
// 		} else {
// 			res.send('File written');
// 		}
// 	});
// });

// //Login

// router.post('/login', (req, res, next) => {
// 	user.findOne({ user_name: req.body.user_name }).then(result => {
// 		if (!result) {
// 			res.status(200).json({ status: 'ERRORNOUSER' });
// 			return;
// 		}

// 		if (
// 			bcrypt.compareSync(req.body.password, result.password) &&
// 			result.valid_user
// 		) {
// 			const jwtBearerToken = jwt.sign({}, decryptedKey, {
// 				algorithm: 'RS256',
// 				expiresIn: '1h',
// 				subject: result._id.toString(),
// 				allowInsecureKeySizes: true
// 			});
// 			if (!process.env.ALLOW_LOCAL_STORAGE) {
// 				res.cookie('SESSIONID', jwtBearerToken, {
// 					httpOnly: true,
// 					secure: true,
// 					maxAge: 3600000
// 				});
// 			}

// 			res.status(200).json({
// 				status: 'LOGGEDIN',
// 				idToken: jwtBearerToken,
// 				expirest: 3600000
// 			});
// 		} else {
// 			res.status(200).json({ status: 'ERRORPASS' });
// 		}
// 	});
// });

// //Logout (Clear Cookie)

// router.get('/logout', checkAuth, (req, res, next) => {
// 	res.clearCookie('SESSIONID');
// 	res.sendStatus(200);
// });
// // router.get('/', checkAuth, (req, res, next) => {
// // 	user.find().then(result => {
// // 		res.json({ users: result });
// // 	});
// // });

// //Create user

// router.post('/', async (req, res, next) => {
// 	console.log(req.body.slot);
// 	const newuser = new user({
// 		full_name: req.body.full_name,
// 		user_name: req.body.user_name,
// 		type: 'admin',
// 		valid_user: true,
// 		email: req.body.email,
// 		slot: req.body.slot,
// 		tel_phone: req.body.tel_phone,
// 		password: bcrypt.hashSync(req.body.password, salt),
// 		country: req.body.country,
// 		userData: {
// 			addDate: req.body.userData.addDate,
// 			lastPlayed: req.body.userData.lastPlayed,
// 			pp_n: req.body.userData.pp_n
// 		}
// 	});
// 	newuser
// 		.save()
// 		.then(result => {
// 			const jwtBearerToken = jwt.sign({}, decryptedKey, {
// 				algorithm: 'RS256',
// 				expiresIn: '1h',
// 				subject: result._id.toString(),
// 				allowInsecureKeySizes: true
// 			});
// 			if (!process.env.ALLOW_LOCAL_STORAGE) {
// 				res.cookie('SESSIONID', jwtBearerToken, {
// 					httpOnly: true,
// 					secure: true,
// 					maxAge: 3600000,
// 					allowInsecureKeySizes: true
// 				});
// 			}

// 			res.status(200).json({
// 				message: 'USERCREATED',
// 				idToken: jwtBearerToken,
// 				expirest: 3600000,
// 				user: result,
// 				err: null
// 			});

// 			const sendData = async () => {
// 				console.log('about to send to Victor');

// 				const transformedData = `trial\n${req.body.full_name}\n${req.body.email}\n${req.body.tel_phone}\n${req.body.slot}\n${req.body.country}\n${req.body.type}\n`;
// 				try {
// 					const headers = { 'Content-Type': 'text/plain' };
// 					const response = await axios.post(
// 						process.env.VICTOR_SERVER,
// 						transformedData,
// 						{
// 							headers: headers
// 						}
// 					);
// 					console.log(response.data);
// 				} catch (error) {
// 					console.log(error);
// 				}
// 			};
// 			sendData();
// 		})
// 		.catch(error => {
// 			console.log(error);
// 			res.json({ message: 'ERROR', err: error, user: null });
// 		});
// });

// //Delete user

// router.delete('/', checkAuth, (req, res, next) => {
// 	var id = req.query.id;
// 	user
// 		.findOneAndDelete({ _id: id })
// 		.then(result => {
// 			res.json({ deleteduser: result, err: null, message: 'Deleted user' });
// 		})
// 		.catch(error => {
// 			res.json({ deleteduser: null, err: error, message: 'ERROR' });
// 		});
// });

// router.post('/check-username', (req, res, next) => {
// 	user.find({}, { user_name: 1, _id: 0 }).then(result => {
// 		var usernameArray = new Array();
// 		for (idx in result) {
// 			usernameArray.push(result[idx].user_name);
// 		}
// 		if (usernameArray.includes(req.body.name)) {
// 			res.json({ unique: false });
// 		} else {
// 			res.json({ unique: true });
// 		}
// 	});
// });
// module.exports = router;
