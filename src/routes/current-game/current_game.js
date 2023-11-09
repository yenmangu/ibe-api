const express = require('express');
const path = require('path');
const tableConfig = require('../../middleware/table_config');
const base_settings = require('../../middleware/base_settings');
const dealFile = require('../../middleware/current_deal_file');

const router = express.Router();
console.log(process.env.PORT);

router.get('/', (req, res) => {
	const port = process.env.PORT;
	res.send({ 'test: ': port });
});

router.post('/table_config', tableConfig.pocessTableConfig);

router.post('/base_settings', base_settings.baseSettings);

router.get('/deal_file', dealFile.processCurrentDealFile);

router.post('/restore-game', (req,res)=> {
	const {gameCode, dirKey, zip} = req.body
	res.status(200).json({message: 'Game restore route'})
})

// router.post('/base_settings');

module.exports = router;
