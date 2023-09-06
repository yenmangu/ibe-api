const mongoose = require('mongoose');

const userData = mongoose.Schema({
	addDate: { type: String, required: true },
	lastPlayed: { type: String, required: false },
	pp_n: { type: String, required: false }
});

const directorSchema = mongoose.Schema(
	{
		full_name: { type: String, required: true },
		user_name: { type: String, required: false },
		type: { type: String, required: true },
		valid_user: { type: Boolean, required: false },
		email: { type: String, required: true, match: /.+\@.+\..+/ }, // Ive removed the unique just for testing
		tel_phone: {
			type: String,
			required: false
			// match: /^\+(?:[0-9] ?){6,14}[0-9]$/
		},
		password: { type: String, required: true },
		country: { type: String, required: true },
		slot: { type: String, unique: true, required: true },
		slots: [
			{
				slot: { type: String, uniqe: true, required: true }
			}
		],
		bex_level: { type: String, required: false },
		userData: { type: userData, required: true }
	},
	{ collection: 'directors_2' }
);

// const User = mongoose.model('user', userSchema, 'users');

// module.exports = User;

module.exports = mongoose.model('director', directorSchema);
