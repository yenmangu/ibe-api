

async function processCurrentDealFile(req, res, next) {
	try {
		console.log('request :', req.query);
		const { gameCode } = req.query;

		

		res.status(200).json({ message: 'api working', test: gameCode });
	} catch (error) {
		return res.status('500').json({ message: 'Internal Server Error', error });
	}
}

module.exports = { processCurrentDealFile };
