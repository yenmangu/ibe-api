const express = require('express');
const dotenv = require('dotenv');
const utilities = require('../util/utilities');
const sheetsController = require('../controllers/googleControllers/sheetsController');
const directorController = require('../controllers/directorController');

dotenv.config();

const router = express.Router();

const filterKeys = ['firstName', 'lastName'];

router.post('/sheet-test', (req, res) => {
	sheetsController.addNewSignUp(req);
	res.status(200).send('Success');
});

// router.post('/', (req, res) => {
// 	const data = req.body;
// 	console.log(data);

// 	const newObj = utilities.getSpecifiedKeys(data, filterKeys);
// 	console.log(newObj);
// 	const nameString = `${newObj.firstName} ${newObj.lastName}`;
// 	const array = Object.values(data);
// 	const keys = Object.keys(data)
// 	res.json({ data: data, newObj: newObj, keys: keys, nameString: nameString });
// });

// router.post('/', async (req, res) => {
// 	console.log('url:', req.originalUrl);
// 	// console.log(req.body.data);
// 	// return;
// 	try {
// 		const data = req.body;
// 		console.log('route data: ', JSON.stringify(data, null, 2));
// 		if (data) {
// 			const result = await sheetsController.addNewSignUp(req,res);
// 		} else {
// 			throw Error('No req.body.data');
// 		}
// 	} catch (err) {
// 		console.error('Error: ', err);
// 		res.status(500).json({ message: 'An error occurred in the route', err });
// 	}
// });

router.post('/', directorController.createDirector);

module.exports = router;
