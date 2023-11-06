const express = require('express');
const gameActionController = require('../../controllers/game_actions');
const upload = require('../../middleware/file')
const router = express.Router();

// /game-actions/

router.post('/finalise', gameActionController.manageGameActions);

router.post('/lock', gameActionController.manageGameActions);

router.post('/redate', gameActionController.manageGameActions);

router.post('/bbo-upload',upload.handleBBO, gameActionController.manageUploads);

router.post('/bcl-upload', gameActionController.manageGameActions);

router.get('/usebio', gameActionController.manageGameActions);

router.post('/merge', gameActionController.manageGameActions);

router.post('/purge', gameActionController.manageGameActions);

module.exports = router;
