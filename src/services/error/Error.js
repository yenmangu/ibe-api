const { devMailService } = require('../mail_service');

/**
 * @class CustomError
 * @extends {Error}
 * @property {ErrorDetails} errorDetails
 */
class CustomError extends Error {
	/**
	 *
	 * @param {string} message
	 * @param {number} status
	 * @param {any} customData
	 */
	constructor(message = 'An error occurred', status = 500, customData = null) {
		super(message); // call parent class parameter
		/** @type {string} */
		this.name = this.constructor.name;
		/** @type {number} */
		this.status = status ? status : 500;
		this.customData = customData || null;
		Error.captureStackTrace(this, this.constructor);
	}

	/**
	 * @typedef {Object} ErrorDetails
	 * @property {string} name
	 * @property {number} status
	 * @property {string} message
	 * @property {string} stack
	 * @property {any} customData
	 */
	/**
	 * A getter for error details.
	 * @returns {ErrorDetails} - An object containing detailed error information
	 */
	get errorDetails() {
		return {
			name: this.name,
			status: this.status,
			message: this.message,
			stack: this.stack ? `${this.stack.replace(/\n/g, '</br>')}` : '',
			// stack: this.stack,
			customData: this.customData
		};
	}
}
module.exports = CustomError;

// 	async sendErrorMail() {
// 		// Timer start
// 		console.log('Starting timer "sendErrorMail": 0s');
// 		console.time('sendErrorMail');
// 		const emailBody = JSON.stringify(this.errorDetails, undefined, 2);
// 		const result = await devMailService.sendMail(emailBody);

// 		console.log('Error email sent with details:\n', emailBody);
// 		// Timer end
// 		console.log(`Ending timer: "sendErrorMail" :`);
// 		console.timeEnd('sendErrorMail');

// 		return result;
// 	}
// }

// this.errorDetails = {
// 	name: this.name,
// 	status: this.status,
// 	message: this.message,
// 	stack: this.stack,
// 	// customData: customData || null
// 	customData: this.customData
// };
