const mongoose = require('mongoose');

const gameConfigSchema = mongoose.Schema(
	{
		game_code: { type: String, require: true },
		game_id: { type: String, unique: true, required: true },
		north: { type: [String], require: true },
		south: { type: [String], require: true },
		east: { type: [String], require: true },
		west: { type: [String], require: true },
		tables: { type: Number, required: true },
		sitters: { type: [String], required: false },
		tableConfig: { type: {}, required: true }
	},
	{ collection: 'game_config' }
);
module.exports = mongoose.model('game_config', gameConfigSchema);
