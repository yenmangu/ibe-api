const express = require('express');
const router = express.Router();

const adminAuthorised = [
	process.env.CLIENT_GC,
	process.env.TEAM_GC,
	process.env.PAIR_GC
];

router.get('/admin-verify', async (req, res, next) => {
	try {
		const params = req.query;
		if (adminAuthorised.includes(params.gameCode)) {
			res.status(200).json({ message: 'Authorised', authStatus: true });
		} else {
			return res.status(400).json({ message: 'Not Authorised', authStatus: false });
		}
	} catch (error) {
		next(error);
	}
});

module.exports = router;
