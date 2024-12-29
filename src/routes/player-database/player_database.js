const express = require('express');
const xmlController = require('../../controllers/xml_controllers/xml_controller');
const playerDbMiddlewware = require('../../middleware/player_db');

//
const router = express.Router();

router.post('/new', playerDbMiddlewware.processObject);
router.post('/update', playerDbMiddlewware.processObject);
router.post('/download', playerDbMiddlewware.coordinateDatabaseOps);
router.post('/bridgewebs/from', playerDbMiddlewware.coordinateBwFromOps);
router.post('/import-new', playerDbMiddlewware.handleDatabaseImport);
router.get('/delete', playerDbMiddlewware.handleDeleteRequest);

module.exports = router;
