const xmlController = require('../controllers/xml_controllers/xml_controller');

exports.processObject = async (req, res) => {
	try {
		if (!req.body) {
			const clientError = new Error('No body in request');
			clientError.status = 400;
			throw clientError;
		}
		console.log(JSON.stringify(req.body, null, 2));
		res.send(req.body);
	} catch (error) {
		throw error;
	}
};
