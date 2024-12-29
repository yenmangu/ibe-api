exports.spectate = async (req, res, next) => {
	try {
		const { gameCode } = req.query;

		if(gameCode){
			return res.status(400).json({message: 'Bad request. No Game Code present'})
		}


	} catch (error) {
		throw error;
	}
};
