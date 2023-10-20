module.exports = (err, req, res, next) => {
	console.error('Error: ', err);
	const status = err.status || 500;
	const message = err.message || 'Internal Server Error';
	console.error(`Error: ${err.status}. ${err.message}. ${err}`)
	res.status(status).json({ message, error: err });
};
