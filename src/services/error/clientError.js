function buildClientError(
	message,
	status,
	stack = 'no stack',
	error = 'No Error details'
) {
	const clientError = new Error('Bad Request');
	clientError.status = status ? status : 400;
	clientError.message = message ? message : '';
	clientError.stack = stack;
	clientError.error = error;
	Object.defineProperty(clientError, 'status', {
		enumerable: true,
		configurable: true,
		value: clientError.status
	});
	Object.defineProperty(clientError, 'message', {
		enumerable: true,
		configurable: true,
		value: clientError.message
	});

	return clientError;
}
module.exports = { buildClientError };
