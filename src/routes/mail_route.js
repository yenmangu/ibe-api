/**
 * @type {import('express')}
 */
const express = require('express');
const { sendNodeMail } = require('../controllers/nodemailer.js');
const multer = require('multer');
const upload = multer({ dest: './uploads' });
const fs = require('fs');
const director = require('../models/director.js');
// const { sendMail } = require('../controller/mail/mailService');
// dotenv.config();
/**
 * @type {import('express').Router} router
 */
const router = express.Router();

// /**
//  * @param {import('express').Request} req
//  * @param {import('express').Response} res
//  * @param {import('express').NextFunction} next
//  */

router.use(function timeLog(req, res, next) {
	console.log('Time: ', Date.now());
	next();
});

/**
 * Route handler
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise< void>}
 */
const mailRouteHandler = async (req, res) => {
	try {
		const {
			recipientFullName,
			recipientUsername,
			recipientEmail,
			recipientSlot,
			mailType,
			userType
		} = req.body;
		if (
			!recipientFullName ||
			!recipientUsername ||
			!recipientEmail ||
			!recipientSlot
		) {
			res.status(400).json({
				message: 'Missing parameters in body'
			});
			return;
		}

		const mailOptions = {
			recipientFullName,
			recipientUsername,
			recipientEmail,
			recipientSlot,
			Subject: 'Welcome to International Bridge Excellence'
		};

		const successMessage = await sendNodeMail(mailOptions);
		if (!successMessage) {
			res.status(500).json({ message: 'Internal server error: Mail not sent.' });
			return;
		}
		res.status(200).json({ message: 'Message sent successfully' });
		return;
	} catch (error) {
		console.error('Error in mail handler: ', error);
		res.status(500).json({ message: 'Internal Server Error', error });
		return;
	}
};

router.post('/', mailRouteHandler);

// router.post('/', async (req, res) => {
// 	// console.log('req.body is:  ', req.body);
// 	try {
// 		const {
// 			recipientFullName,
// 			recipientUsername,
// 			recipientEmail,
// 			recipientSlot,
// 			mailType,
// 			userType
// 		} = req.body;
// 		// console.log('Object destructuring', req.body);
// 		// return

// 		const mailOptions = {
// 			recipientFullName,
// 			recipientUsername,
// 			email: recipientEmail,
// 			recipientSlot,
// 			subject: 'Welcome to International Bridge Excellence'
// 			// let successMessage = 1;
// 		};

// 		console.log('mail options are: ', mailOptions);
// 		// return;
// 		const successMessage = await sendNodeMail(mailOptions);
// 		if (!successMessage) {
// 			return res
// 				.status(500)
// 				.json({ message: 'Internal Server Error. Mail not sent' });
// 		}
// 		res.status(200).json({ message: 'Mail sent to backend successfully' });
// 	} catch (err) {
// 		console.error(err);
// 		res.status(500).json({ message: 'Internal Server Error', err });
// 	}
// });

module.exports = router;
