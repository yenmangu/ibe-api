const express = require('express');
const { sendNodeMail } = require('../controllers/nodemailer.js');
const multer = require('multer');
const upload = multer({ dest: './uploads' });
const fs = require('fs');
const director = require('../models/director.js');
// const { sendMail } = require('../controller/mail/mailService');
// dotenv.config();

const router = express.Router();

router.use(function timeLog(req, res, next) {
	console.log('Time: ', Date.now());
	next();
});

// router.post('/', async (req, res) => {
// 	try {
// 		const {
// 			first_name,
// 			last_name,
// 			email,
// 			phone_number,
// 			organisation,
// 			location,
// 			message
// 		} = req.body;
// 		console.log(req.body);
// 		// return
// 		const mailOptions = {
// 			firstName: first_name,
// 			lastName: last_name,
// 			email: email,
// 			subject: 'Welcome to Paragon Security'
// 			// let successMessage = 1;
// 		};
// 		const successMessage = await sendNodeMail(mailOptions);
// 		if (!successMessage) {
// 			return res
// 				.status(500)
// 				.json({ message: 'Internal Server Error. Mail not sent' });
// 		} else {
// 			const newCustomer = new Customer({
// 				first_name,
// 				last_name,
// 				email,
// 				phone_number,
// 				organisation,
// 				location,
// 				message
// 			});

// 			await newCustomer.save();
// 		}
// 		res.status(200).json({ message: 'Mail sent to backend successfully' });
// 	} catch (err) {
// 		console.error(err);
// 		res.status(500).json({ message: 'Internal Server Error', err });
// 	}
// });

// module.exports = router;

// res
// 	.status(201)
// 	.json({
// 		message: `Customer: ${newCustomer.first_name} +${newCustomer.last_name} creation sucessful`
// 	});

// }

// let mailObj = {};
// mailObj = req.body;
// const data = await customer.find;

router.post('/', async (req, res) => {
	// console.log('req.body is:  ', req.body);
	try {
		const {
			recipientFullName,
			recipientUsername,
			recipientEmail,
			recipientSlot,
			mailType,
			userType
		} = req.body;
		// console.log('Object destructuring', req.body);
		// return

		const mailOptions = {
			recipientFullName,
			recipientUsername,
			email: recipientEmail,
			recipientSlot,
			subject: 'Welcome to International Bridge Excellence'
			// let successMessage = 1;
		};

		console.log('mail options are: ', mailOptions);
		// return;
		const successMessage = await sendNodeMail(mailOptions);
		if (!successMessage) {
			return res
				.status(500)
				.json({ message: 'Internal Server Error. Mail not sent' });
			// } else {
			// 	const newDirector = new director({
			// 		first_name,
			// 		last_name,
			// 		email,
			// 		phone_number,
			// 		organisation,
			// 		location,
			// 		message
			// 	});

			// 	await newDirector.save();
		}
		res.status(200).json({ message: 'Mail sent to backend successfully' });
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'Internal Server Error', err });
	}
});

module.exports = router;
