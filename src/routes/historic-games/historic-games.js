const express = require('express');
const dotenv = require('dotenv');
const historicGames = require('../../controllers/historic_games_controller')


const router = express.Router();

router.post('/restore', historicGames.historicGamesController)
module.exports = router;
