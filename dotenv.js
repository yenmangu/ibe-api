const dotenv = require('dotenv');

const LoadEnv = () => {
	const result = dotenv.config();
	if (result.error) {
		throw result.error;
	}
};


module.exports = { LoadEnv };
