const publicGameController = require('../controllers/public_game_controller');
const CustomError = require('../services/error/error');

exports.getGameConfig = async (req, res, next) => {
	try {
		if (!req.query) {
			const clientError = new CustomError('No params in request URL');
			clientError.status = 400;
			clientError.message = 'No query params in URL';
			throw clientError;
		}

		const { game_code, game_id } = req.query;
		console.log(req.query);

		console.log(game_code, game_id);
		const foundGameConfig = await publicGameController.getPublicGame(
			game_code,
			game_id
		);
		console.log('middleware result: ', foundGameConfig);

		if (foundGameConfig) {
			res.status(200).json({ foundGameConfig });
		}
	} catch (error) {
		return res.status(500).json({ message: 'Internal Server CustomError', error });
	}
};

exports.saveGameConfig = async (req, res, next) => {
	try {
		console.log(req.query);
		console.log(req.body);

		const { game_code } = req.query;
		const gameConfig = req.body;

		if (!game_code) {
			const clientError = new CustomError();
			clientError.status = 400;
			clientError.message = "'No gamecode present for saving game config'";
			throw clientError;
		}

		if (!gameConfig) {
			console.log('no config provided');

			const clientError = new CustomError();
			clientError.status = 400;
			clientError.message = 'No game config provided';
			throw clientError;
		}

		const savedConfig = await publicGameController.savePublicGame(
			game_code,
			gameConfig
		);
		res.status(200).json({ savedConfig });
	} catch (error) {
		return res
			.status(error.status)
			.json({ message: 'Internal Server CustomError', error });
	}
};
