const mongoose = require('mongoose');

const gameConfigSchema = mongoose.Schema(
	{
		game_code: { type: String, require: true },
		game_id: { type: String, unique: true, required: true },
		matchType: { type: String, required: false },
		north: { type: [String], require: true },
		south: { type: [String], require: true },
		east: { type: [String], require: true },
		west: { type: [String], require: true },
		tables: { type: Number, required: true },
		sitters: { type: [String], required: false },
		tableConfig: { type: {}, required: true },
		eventName: { type: String, required: false },
		pairConfig: { type: {}, required: false },
		pairNumbers: { type: {}, required: false },
		teamConfig: { type: {}, required: false },
		individuals: {type: {}, required: false}
	},
	{ collection: 'game_config' }
);
module.exports = mongoose.model('game_config', gameConfigSchema);
