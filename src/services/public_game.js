const mongoose = require('mongoose');
const gameConfig = require('../models/game_config');

async function saveGameConfig(gameCode, gameId, gameConfigData) {
	try {
		if (!gameConfigData) {
			const clientError = new Error('Client Error: No game config to store');
			clientError.status = 400;
			throw clientError;
		}
		if (!gameCode && !gameId) {
			const clientError = new Error(
				'Client Error: No Game Code or Game ID for storing game config'
			);
			clientError.status = 400;
			throw clientError;
		}

		console.log('game config data: ', gameConfigData);


		const newGameConfig = new gameConfig({
			game_code: gameCode,
			game_id: gameId,
			matchType: gameConfigData.matchType,
			north: gameConfigData.north,
			south: gameConfigData.south,
			east: gameConfigData.east,
			west: gameConfigData.west,
			tables: gameConfigData.tables,
			sitters: gameConfigData.sitters,
			tableConfig: gameConfigData.tableConfig,
			eventName: gameConfigData.eventName,
			pairNumbers: gameConfigData.pairNumbers,
			pairConfig: gameConfigData.pairConfig,
			teamConfig: gameConfigData.teamConfig,
			individuals: gameConfigData.individuals
		});

		const result = await newGameConfig.save();

		if (!result) {
			const serverError = new Error('Error saving game');
			serverError.status = 500;
			throw serverError;
		}
		return result;
	} catch (error) {
		throw error;
	}
}

async function getGameConfig(gameCode, gameId) {
	try {
		if (!gameCode && !gameId) {
			const clientError = new Error(
				'Client Error: No Game Code for game retrieval'
			);
			clientError.status = 400;
			clientError.message = 'No game_code or game_id for retrieval';
			throw clientError;
		}

		const foundGameConfig = await gameConfig.findOne({
			game_code: gameCode,
			game_id: gameId
		});
		if (!foundGameConfig) {
			const serverError = new Error('No found game config');
			serverError.status = 500;
			throw serverError;
		} else {
			// console.log(foundGameConfig);
			return foundGameConfig;
		}
	} catch (error) {
		throw error;
	}
}

module.exports = { getGameConfig, saveGameConfig };
