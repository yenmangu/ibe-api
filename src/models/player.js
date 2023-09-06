const mongoose = require('mongoose');

const playerData = mongoose.Schema({
	addDate: { type: String, required: true },
	lastPlayed: { type: String, required: false },
	pp_n: { type: String, required: false }
});

const playerSchema = mongoose.Schema(
	{
		slot: { type: String, required: true },
		full_name: { type: String, required: true },
		table_no: { type: Number, required: true },
		direction: { type: String, required: true, match: /^(north|east|south|west)$/ },
		playerData: { type: playerData, required: true }
	},
	{ collection: 'players' }
);

module.exports = mongoose.model('player', playerSchema)
