const mongoose = require('mongoose');
const gameConfig = require('../models/game_config');
const CustomError = require('./error/Error');

function buildClientError(message, status) {
	const clientError = new CustomError('Bad Request');
	clientError.status = status ? status : 400;
	clientError.message = message ? message : '';
	Object.defineProperty(clientError, 'status', {
		enumerable: true,
		configurable: true,
		value: clientError.status
	});
	Object.defineProperty(clientError, 'message', {
		enumerable: true,
		configurable: true,
		value: clientError.message
	});

	return clientError;
}

async function saveGameConfig(gameCode, gameId, gameConfigData) {
	try {
		if (!gameConfigData) {
			const error = buildClientError('Client Error: No game config to store', 400);
			throw error;
		}
		if (!gameCode && !gameId) {
			const error = buildClientError(
				'Client Error: No Game Code or Game ID for storing game config',
				400
			);
			throw error;
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
			const serverError = buildClientError('Error Saving Game', 500);
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
			const error = buildClientError(
				'Client Error: No Game Code for game retrieval',
				400
			);
			throw error;
		}

		const foundGameConfig = await gameConfig.findOne({
			game_code: gameCode,
			game_id: gameId
		});
		if (!foundGameConfig) {
			const serverError = buildClientError('No game config found', 500);
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
