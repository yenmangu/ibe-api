// function buildClientError(
// 	message,
// 	status,
// 	stack = 'no stack',
// 	error = 'No Error details'
// ) {
// 	const clientError = new Error('Bad Request');
// 	clientError.status = status ? status : 400;
// 	clientError.message = message ? message : '';
// 	clientError.stack = stack;
// 	clientError.error = error;
// 	Object.defineProperty(clientError, 'status', {
// 		enumerable: true,
// 		configurable: true,
// 		value: clientError.status
// 	});
// 	Object.defineProperty(clientError, 'message', {
// 		enumerable: true,
// 		configurable: true,
// 		value: clientError.message
// 	});

// 	return clientError;
// }

class CustomError extends Error {
	constructor(
		message,
		status = 400,
		stack = 'No stack',
		error = 'No Error details',
		additionalDetails = {}
	) {
		super(message);
		(this.name = 'ClientError'), (this.status = status);
		this.stack = stack;
		this.error = error;

		for (const [key, value] of Object.entries(additionalDetails)) {
			this[key] = value;
		}

		Object.defineProperty(this, 'status', {
			enumerable: true,
			configurable: true,
			value: this.status
		});
		Object.defineProperty(this, 'message', {
			enumerable: true,
			configurable: true,
			value: this.message
		});
		Object.defineProperty(this, 'stack', {
			enumerable: true,
			configurable: true,
			value: this.stack
		});
		Object.defineProperty(this, 'error', {
			enumerable: true,
			configurable: true,
			value: this.error
		});
	}
}

function buildCustomError(
	message,
	status,
	stack = 'no stack',
	error = 'No Error details',
	additionalDetails = {}
) {
	return new CustomError(message, status, stack, error, additionalDetails);
}
module.exports = { buildCustomError, CustomError };
