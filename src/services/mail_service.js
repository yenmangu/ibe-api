const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const nodemailer = require('nodemailer');
const fs = require('fs').promises;

async function readFileAsync(filepath, encoding) {
	try {
		const content = await fs.readFile(filepath, encoding);
		return content;
	} catch (err) {
		throw err;
	}
}

const devAuthConfig = {
	auth: {
		user: process.env.TEST_MAIL,
		pass: process.env.NEW_TEST_APP_PASS
	}
};

const prodAuthConfig = {
	auth: {
		user: process.env.SMTP_EMAIL_2,
		pass: process.env.SMTP_PASS_2
	}
};

class EmailService {
	constructor(authConfig = {}) {
		this.mainSmtpConfig = {
			host: 'smtp.gmail.com',
			port: 465,
			secure: true,
			auth: {}
		};
		this.smtpConfig = {
			...this.mainSmtpConfig,
			...authConfig
		};
	}
	async sendMail(error) {
		console.log('error object: ', error);
		console.log('error name: ', error.constructor.name);
		return;
		try {
			// Timer Start
			console.log('Starting timer "sendMail": 0s');
			console.time('sendMail');

			const errorMailTemplate = await readFileAsync(
				path.join(__dirname, '..', 'email', 'templates', 'dev_Mail', 'error.html'),
				'utf8'
			);

			const transport = await nodemailer.createTransport({
				...this.smtpConfig,
				auth: {
					...this.smtpConfig.auth,
					...devAuthConfig.auth
				}
			});
			console.log('SMTP CONFIG: ', this.smtpConfig);

			const mailOptions = {
				from: this.smtpConfig.auth.user,
				to: [process.env.DEV_ADMIN, process.env.DEV_ADMIN_SECONDARY],
				subject: `IBE Server Error: ${error.name}`,
				html: errorMailTemplate.replace('[error_details]', error)
				// text: error
			};

			const info = await transport.sendMail(mailOptions);
			if (info) {
				console.log('mail sent successfully: ', info.messageId);
			}

			// Timer End
			console.log(`Ending timer: "SendMail" :`);
			console.timeEnd('sendMail');

			return { messageId: info.messageId };
		} catch (err) {
			console.error('Error sending mail: ', err);
		}
	}
}

const devMailService = new EmailService(devAuthConfig);

async function sendDetails(contact) {
	try {
	} catch (err) {
		console.error('Internal Server Error');
	}
}

async function sendError() {
	try {
	} catch (err) {
		console.error('Error Sending Mail', err);
	}
}

module.exports = {
	devMailService,
	devAuthConfig,
	prodAuthConfig,
	sendDetails
};
