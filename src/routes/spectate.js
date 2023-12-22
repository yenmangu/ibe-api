const app = require('express');

const router = app.Router();

router.get('', (req, res) => {
	res.status(200).json({ message: 'spectate route' });
});

module.exports = router;
