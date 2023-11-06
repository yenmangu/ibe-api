const xmlController = require('../controllers/xml_controllers/xml_controller');

async function processObject(req, res) {
	try {
		if (!req.body) {
			const clientError = new Error('No body in request');
			clientError.status = 400;
			throw clientError;
		}
		console.log(JSON.stringify(req.body, null, 2));
		const data = req.body
		console.log('req.body: ',data);
		
		const processedJSON = await xmlController.processPlayerDatabase(data);
		console.log(processedJSON);


		res.send(req.body);
	} catch (error) {
		throw error;
	}
}
module.exports = { processObject };
