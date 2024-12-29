require('dotenv').config();
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs').promises;
// const { promisify } = require('util');

async function readFileAsync(filePath) {
	try {
		const content = await fs.readFile(filePath, 'utf8');
		return content.toString();
	} catch (err) {
		throw err;
	}
}
const smtp = {
	host: 'smtp.gmail.com',
	port: 465,
	secure: true, // use TLS

	auth: {
		user: process.env.SMTP_EMAIL_2,
		pass: process.env.SMTP_PASS_2
	}
};

async function sendDetails(contact) {
	try {
		if (!contact) {
			console.log('no contact for nodeMail');
		}

		const transport = nodemailer.createTransport(smtp);
		const template = await readFileAsync(
			path.join(__dirname, '..', 'email', 'templates', 'updated_email.html')
		);
		let mailOptions = {
			from: smtp.auth.user,
			to: contact.email,
			bcc: process.env.IBE_ADMIN,
			subject: `Email Updated for game code ${contact.gameCode}`,
			html: template
				.replace('{{name}}', contact.name)
				.replace('{{slot}}', contact.gameCode)
				.replace('{{email}}', contact.email)
		};
		const info = await transport.sendMail(mailOptions);
		return { messageId: info.messageId };
	} catch (err) {
		console.error('Error sending mail', err);
		throw err;
	}
}

async function sendNodeMail(contact) {
	console.log('Contact to send to: ', contact);
	const transport = nodemailer.createTransport(smtp);
	if (!transport) {
		console.log('No Transport created');
	}
	const template = await readFileAsync(
		path.join(__dirname, '..', 'email', 'templates', 'welcome_email.html')
	);
	if (!template) {
		console.log('No Template found');
	}
	try {
		console.log('email contact', contact);
		let mailOptions = {
			from: smtp.auth.user,
			to: contact.email,
			bcc: process.env.IBE_ADMIN,
			subject: 'Welcome to International Bridge Excellence',
			html: template
				.replace('[name]', contact.name)
				.replace('[gameCode]', contact.gameCode)
				.replace('[dirKey]', contact.directorKey)
		};
		const info = await transport.sendMail(mailOptions);
		return { messageId: info.messageId };
	} catch (err) {
		console.error(err);
		`An error occurred while attempting to send the mail. Error: ${err}`;
	}
}

async function sendNewPass(contact) {
	// test template

	try {
		const transport = nodemailer.createTransport(smtp);
		// const template = readFileAsync(
		// 	path.join(__dirname, '..', 'email', 'templates', 'sendPass.html'),
		// 	'utf8'
		// );

		const password_email = await readFileAsync(
			path.join(__dirname, '..', 'email', 'templates', 'test_template.html')
		);
		if (password_email) {
			console.log('welcomeEmail Found: ');
		} else {
			console.log('No test_template');
		}
		// console.log('contact: ', contact);
		const mailOptions = {
			from: smtp.auth.user,
			to: contact.email,
			bcc: process.env.IBE_ADMIN,
			subject: 'IBEScore Password Reset Request',
			// 	html: template
			// 		.replace('[full_name]', contact.recipientFullName)
			// 		.replace('[slot]', contact.recipientSlot)
			html: password_email
				.replace('{{email}}', contact.email)
				.replace('{{password}}', contact.newPassword)
				.replace('{{slot}}', contact.slot)
		};
		try {
			const info = await transport.sendMail(mailOptions);
			if (info) {
				// console.log('Success sending mail', info.messageId);
				return { messageId: info.messageId };
			}
		} catch (err) {
			console.error(`Error sending mail`, err);
			throw err;
		}
	} catch (err) {
		console.error(
			`An error occurred while attempting to send the mail. Error: ${err}`
		);
		throw err;
	}
}

module.exports = { sendNodeMail, sendNewPass, sendDetails };
