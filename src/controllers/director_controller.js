// @ts-nocheck
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const director = require('../models/director'); // Assuming you have a model named 'director'
/**
 * @type {import('axios')}
 */
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const generateSlot = require('./user/slot_creation');
const genPass = require('./user/generate_password');
const sendMail = require('./nodemailer');
const sheetController = require('./google_controllers/sheets_controller');
dotenv.config();

// Keys
const keyPass = process.env.KEY_PASS;
const RSA_PRIVATE_KEY = fs.readFileSync(
	path.join(__dirname, '../../keys/private_key.pem')
);
const decryptedKey = crypto.createPrivateKey({
	key: RSA_PRIVATE_KEY,
	passphrase: keyPass
});

// bcrypt salt constant
const saltChars =
	'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789$%^&*()-_+=~';
const salt = bcrypt.genSaltSync(10, { charset: saltChars });

let slotExists = true;
// Function to check if the slot exists in the database
async function checkSlotExists(slot) {
	try {
		console.log('at checkSlotExists() slot: ', slot);
		// Perform a database query to check if the slot exists

		const existingDirector = await director.findOne({
			slot: { $regex: new RegExp(`^${slot}$`, 'i') }
		});

		if (existingDirector) {
			console.log('existing director: ', existingDirector);
			slotExists = true;
			// Slot already exists, throw an error
			throw new Error(`Slot ${slot} already exists`);
		} else {
			slotExists = false;
		}
		return slotExists;
	} catch (err) {
		// Catch any errors that occur during the database query
		console.error('Internal Server Error', err);
		throw err;
	}
}

async function createDirector(req, res, next) {
	console.log(req.originalUrl);
	let fullName;
	let tempSlot;
	let password;
	let tel_phone;
	let username;
	if (req.originalUrl === '/ibescore/register') {
		console.log(req.body.directorKey);

		fullName = `${req.body.firstName} ${req.body.lastName}`;
		username = `${req.body.firstName}_${req.body.lastName}`;
		tempSlot = req.body.gameCode;
		password = req.body.directorKey;
		tel_phone = req.body.internationalTelNumber;
		if (!req.body.gameCode) {
			tempSlot = generateSlot();
		}
	} else {
		fullName = req.body.full_name;
		username = req.body.user_name;
		tempSlot = req.body.slot;
		password = req.body.password;
		tel_phone = req.body.tel_phone;
		if (!req.body.slot) {
			tempSlot = generateSlot();
		}
	}
	const newSlot = {
		slot: tempSlot
	};

	console.log(password);

	const oldSlot = tempSlot ? tempSlot : newSlot.slot;
	const hashedPassword = bcrypt.hashSync(password, salt);
	let victorError = false;
	try {
		// Perform a database query to check if the slot exists
		const existingDirector = await director.findOne({
			slot: { $regex: new RegExp(`^${oldSlot}$`, 'i') }
		});

		if (existingDirector) {
			const error = new Error('SLOT_EXISTS');
			error.slot = oldSlot;
			// Slot already exists, throw an error
			throw error;
		} else {
			try {
				const response = await sendData(
					fullName,
					req.body.email,
					tel_phone,
					tempSlot,
					req.body.country,
					req.body.type,
					hashedPassword
				);

				console.log('victor-response: ', response);
			} catch (err) {
				victorError = true;
				console.log('vic error: ', err.message);
				if (victorError && err.message === 'SLOT_EXISTS') {
					const error = new Error('SLOT_EXISTS');
					error.slot = oldSlot;
					throw error;
				} else {
					return res.status(500).json({ message: 'VIC_ERROR', victorError });
				}
			}

			if (!victorError) {
				// Slot does not exist, proceed with saving the newDirector
				const mailOptions = {
					email: req.body.email,
					gameCode: tempSlot,
					name: req.body.firstName ? req.body.firstName : fullName,
					directorKey: password
				};
				if (mailOptions) {
					console.log('Mail Options correct, about to invoke sendNodeMail()');

					const result = await sendMail.sendNodeMail(mailOptions);
					console.log(result);
				} else {
					console.log('Failed to send welcome email');
				}

				const userData = {
					addDate: new Date().getTime(),
					lastPlayed: req.body.userData?.lastPlayed || '',
					pp_n: req.body.userData?.pp_n || ''
				};

				const newDirector = new director({
					full_name: fullName,
					user_name: req.body.user_name,
					type: req.body.type,
					valid_user: true,
					email: req.body.email,
					slot: tempSlot,
					slots: [newSlot],
					tel_phone: tel_phone,
					password: hashedPassword,
					salt: salt,
					country: req.body.country,
					userData: userData
				});

				// Save the newDirector to the database
				const result = await newDirector.save();
				// check result
				if (!result) {
					throw new Error('Error saving to the database');
				} else {
					// console.log('director saved: ', result);
					// Generate a JWT token and send it to the front end
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

					if (req.originalUrl === '/ibescore/register') {
						await addToSheet(req, res);
					}

					// Respond with success and the JWT token
					res.status(200).json({
						message: 'DIRECTOR_CREATED',
						idToken: jwtBearerToken,
						expires: 3600000,
						user: result,
						err: null
					});
				}
			}
		}
	} catch (err) {
		console.error('Internal Server Error', err);
		let errorResponse = {
			message: 'ERROR',
			err: err.message,
			user: null
		};
		if (err.slot) {
			errorResponse.slot = err.slot;
		}
		res.status(400).json(errorResponse);

		// If the slot already exists or any other error occurs, send an error response to the front end
	}
}

async function addToSheet(req, res) {
	try {
		await sheetController.addNewSignUp(req, res);
	} catch (err) {
		console.error('Error adding to sheet', err);
	}
}

async function sendData(
	fullName,
	email,
	telPhone,
	slot,
	country,
	type,
	hashedPassword
) {
	console.log('about to send to Victor');
	const transformedData = `trial\n${fullName}\n${email}\n${telPhone}\n${slot}\n${country}\n${type},${hashedPassword}\n`;
	// console.log(transformedData);
	// return;

	try {
		/**
		 * @type {string} VIC_SERVER
		 */
		let VIC_SERVER;

		if (process.env.VICTOR_SERVER) {
			VIC_SERVER = process.env.VICTOR_SERVER;
			const headers = { 'Content-Type': 'text/plain' };
			const response = await axios.post(VIC_SERVER, transformedData, {
				headers: headers
			});
			// console.log('createDirector :', response);

			const lines = response.data.split();
			const result = lines[0].trim().toLowerCase();
			// console.log('result: ', result, '     end result');
			console.log(response.data);
			const split = result.split('\n');

			if (result === 'success') {
				console.log("Success from Victor's Server");
				return result;
			} else {
				if (split[1] === 'slotalreadyexists')
					// console.log(result);
					throw new Error('SLOT_EXISTS');
			}
		}
		// console.log(response);
	} catch (err) {
		// console.log('error: ', err);
		throw err;
	}
}

async function updatePassword(req, res, next) {
	// console.log(req)
	// console.log(req.body);
	// console.log(req.query.SLOT);
	const slot = req.query.SLOT;
	const { directorId, currentPassword, password } = req.body;
	const hashedNewPassword = bcrypt.hashSync(password, salt);
	const data = {
		slot: slot,
		currentPassword: currentPassword,
		hashedNewPassword: hashedNewPassword
	};

	// Attempt to update Victor's data
	try {
		const result = await sendUpdatedPass(data);
		if (result.errorCode) {
			return res
				.status(500)
				.json({ message: result.message, err: result.errorCode });
		} else {
			// Upon successful sending, update our database
			let updatedDirector;
			const updateDatabase = async () => {
				try {
					updatedDirector = await director.findByIdAndUpdate(
						directorId,
						{ password: hashedNewPassword },
						{ new: true }
					);
					if (!updatedDirector) {
						throw new Error('DIR_NOT_FOUND');
					}
					// Password update successful
					// Any other logic related to successful update can be added here
					return updatedDirector; // Optionally, return the updatedDirector if needed
				} catch (err) {
					console.error('Failed to update database', err);
					throw err; // Re-throw the error to be handled by the calling code
				}
			};

			try {
				await updateDatabase();
				// Upon total success
				res.status(200).json({
					message: 'Password updated successfully',
					director: updatedDirector,
					success: true
				});
			} catch (err) {
				console.error('Error updating password', err);
				return res.status(500).json({ message: 'Internal Server Error', err: err });
			}
		}
	} catch (err) {
		console.error('Error sending to Victor', err);
		return res.status(500).json({ message: 'Internal Server Error', err: err });
	}
}

async function sendUpdatedPass(data) {
	try {
		console.log('Sending request to Victor with the following data:');
		console.log('Slot:', data.slot);
		console.log('Current Password:', process.env.MASTER_PASS);
		console.log('Hashed New Password:', data.hashedNewPassword);

		const url = process.env.UPDATE_PASS;
		const string = `${data.slot}\nDIRPASS\n${process.env.MASTER_PASS}\n${data.hashedNewPassword}`;
		const headers = { 'Content-Type': 'text/plain' };

		console.log('const string is:\n', string);
		/**
		 * @type {import('axios').AxiosResponse} response
		 */
		const response = await axios.post(url, string, { headers: headers });
		let result;
		if (response) {
			const lines = response.data.split('\n');
			result = lines[0].trim().toLowerCase();
			console.log('-----\nresult from V: ', result, '\n-----');
			if (result === 'success') {
				console.log('Success updating password on Victor server');
			} else {
				const error = new Error('Sent to victor fine, but did not update');
				error.errorCode = 'NOT_UPDATE';
				error.result = result;
				throw error;
			}
		} else {
			const error = new Error("Error sending to victor's server");
			error.errorCode = 'VICTOR_ERROR';
			throw error;
		}
		return { result };
	} catch (err) {
		console.error('Error Sending UpdatedPassword', err);
		// console.error('Stack Trace', err.stack);
		throw err;
	}
}

async function findContactBuildMailOptions(slot, email, password) {
	console.log('findContactBuildMailOptions() called');
	try {
		const contactDetails = await director.findOne({ slot, email });

		if (contactDetails) {
			console.log('contactDetails: ', contactDetails);
			if (contactDetails.email !== email) {
				console.log('Incorrect Email', email);
				return res.status(401).json({ message: 'Incorrect Email', email });
			} else {
				const mailOptions = {
					email: contactDetails.email,

					fullName: contactDetails.full_name,
					slot: contactDetails.slot,
					newPassword: password
				};
				console.log('mailOptions: ', mailOptions);
				return mailOptions;
			}
		} else {
			console.log(`no director with Game Code ${slot} found`);
			return null;
		}
	} catch (err) {
		console.error('Error finding contact details', err);
		throw err;
	}
}

async function updateDatabase(slot, email, hashedNewPassword) {
	try {
		console.log('password to update: ', hashedNewPassword);

		const dirToUpdate = await director.findOne({ slot: slot, email: email });
		dirToUpdate.password = hashedNewPassword;

		if (!dirToUpdate) {
			throw new Error('DIR_NOT_FOUND');
		}

		await dirToUpdate.save();
		console.log('password updated successfully');
		return dirToUpdate;
		// const updatedDirector = await director.findOneAndUpdate(
		// 	{ slot: slot },
		// 	{ email: email },
		// 	{ $set: { password: hashedNewPassword } },
		// 	{ new: true }
		// );
		// Password update successful
	} catch (err) {
		console.error('Failed to update database', err);
		throw err; // Re-throw the error to be handled by the calling code
	}
}

async function handlePassReq(req, res) {
	try {
		const slot = req.query.SLOT;
		const { email } = req.body;
		const password = genPass();
		const hashedNewPassword = bcrypt.hashSync(password, salt);
		console.log('generated password', password);
		console.log('hashedNewPassword', hashedNewPassword);
		const data = {
			slot: slot,
			hashedNewPassword: hashedNewPassword
		};
		console.log('data is: ', data);
		// return
		let updatedDirector;
		const mailOptions = await findContactBuildMailOptions(slot, email, password);
		const victorData = {
			slot: slot,
			currentPassword: process.env.MASTER_PASS,
			hashedNewPassword: hashedNewPassword
		};

		if (mailOptions) {
			// console.log(mailOptions);
			const result = await sendMail.sendNewPass(mailOptions);

			console.log(result);
		} else {
			console.error('Failed to send email');
		}

		const result = await sendUpdatedPass(victorData);
		if (result.errorCode) {
			return res
				.status(500)
				.json({ message: result.message, err: result.errorCode, success: false });
		}
		const updatedDir = await updateDatabase(slot, email, hashedNewPassword);

		console.log('from calling function, updatedDir: ', updatedDir);

		// console.log(mailOptions, success);
		// Upon total success
		res.status(200).json({
			message: 'Password updated successfully',
			director: updatedDirector,
			success: true
		});
	} catch (err) {
		console.error('Error generating new password', err);
		res.status(500).json({ message: 'Internal Server Error', err });
	}
}

module.exports = {
	createDirector,
	updatePassword,
	handlePassReq,
	addToSheet
};
