require('dotenv').config({path: '../../.env'});
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');

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
}

const testAuthConfig = {
	auth: {
		user: process.env.TEST_MAIL,
		pass: process.env.NEW_TEST_APP_PASS
	}
};

const newAuth ={
	auth: {
		user: 'test_user',
		pass: 'test_pass'

	}
}

const testMailService = new EmailService(newAuth);

console.log(testAuthConfig);
