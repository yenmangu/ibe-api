const { devMailService } = require('./mail_service');

class CustomError extends Error {
	constructor(message, errCode, customData) {
		super(message);
		this.name = this.constructor.name;
		this.errCode = errCode;
		Error.captureStackTrace(this, this.constructor);

		this.errorDetails = {
			name: `${this.name}`,
			code: `${this.errCode}`,
			message: `${this.message}`,
			stack: this.stack ? `${this.stack.replace(/\n/g, '</br>')}` : '',
			customData: customData || null
		};
	}

	async sendErrorMail() {
		// Timer start
		console.log('Starting timer "sendErrorMail": 0s');
		console.time('sendErrorMail');
		// const emailBody = this.errorDetails;

		const emailBody = JSON.stringify(this.errorDetails, undefined, 2);
		const result = await devMailService.sendMail(emailBody);

		console.log('Error email sent with details:\n', emailBody);
		// Timer end
		console.log(`Ending timer: "sendErrorMail" :`);
		console.timeEnd('sendErrorMail');

		return result;
	}
}
module.exports = CustomError;
