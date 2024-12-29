const express = require('express')
const lineupMiddleware = require('../middleware/lineup_middleware')

const router = express.Router()

router.get(`/games`, lineupMiddleware.getGameConfig)

router.post('/games', lineupMiddleware.saveGameConfig)

module.exports = router