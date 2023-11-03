const express = require('express');
const xmlController = require('../../controllers/xml_controllers/xml_controller')
const playerDbMiddlewware = require ('../../middleware/player_db')

//
const router = express.Router();

router.post('', playerDbMiddlewware.processObject )

module.exports = router;