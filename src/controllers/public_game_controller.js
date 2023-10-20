const public_game = require('../services/public_game.js');
const generateUniqueId = require('../util/generateUniqeId.js');

async function savePublicGame(game_code, gameConfig) {
	const game_id = generateUniqueId(8);
	try {
		const newPublicGame = await public_game.saveGameConfig(
			game_code,
			game_id,
			gameConfig
		);
		return newPublicGame
	} catch (error) {
		console.error('error in controller: ', error)
		throw error;
	}
}

async function getPublicGame(gameCode, gameId) {
	try {
		const foundPublicGame = await public_game.getGameConfig(gameCode, gameId);
		if (!foundPublicGame) {
			throw new Error('Internal Server Error');
		}
		console.log(foundPublicGame);
		return foundPublicGame;
	} catch (error) {
		throw error;
	}
}

module.exports = { getPublicGame, savePublicGame };
