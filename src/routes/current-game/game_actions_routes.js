const express = require('express');
const gameActionController = require('../../controllers/game_actions');
const upload = require('../../middleware/file');
const router = express.Router();

// /game-actions/

router.post('/finalise', gameActionController.manageGameActions);

router.post('/lock', gameActionController.manageGameActions);

router.post('/redate', gameActionController.manageGameActions);

router.post('/bbo-upload', upload.handleBBO, gameActionController.manageUploads);

router.post('/usebio', upload.handleUSEBIO, gameActionController.manageUploads);

router.post('/merge', gameActionController.manageGameActions);

router.post('/purge', gameActionController.manageGameActions);

// Not needed for now
// router.post('/bcl-upload', gameActionController.manageGameActions);

module.exports = router;
