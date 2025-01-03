const express = require('express');
const router = express.Router();

const adminAuthorised = [
	process.env.CLIENT_GC,
	process.env.TEAM_GC,
	process.env.PAIR_GC,
	process.env.NIC_EIGHT,
	process.env.NIC_NINE,
	process.env.PONTY,
	process.env.NICOLEC
];

router.get('/admin-verify', async (req, res, next) => {
	try {
		const params = req.query;
		console.log('params in verify admin: ', params);

		const gameCode = params.gameCode?.toString();
		if (adminAuthorised.includes(gameCode)) {
			res.status(200).json({ message: 'Authorised', authStatus: true });
		} else {
			res.status(400).json({ message: 'Not Authorised', authStatus: false });
		}
	} catch (error) {
		next(error);
	}
});

module.exports = router;
