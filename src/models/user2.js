const mongoose = require('mongoose');

const userData = mongoose.Schema({
	addDate: { type: String, required: true },
	lastPlayed: { type: String, required: false },
	pp_n: { type: String, required: false }
});

const userSchema = mongoose.Schema(
	{
		full_name: { type: String, required: true },
		user_name: { type: String, required: true },
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
		slots: [
			{
				slot: { type: String, required: true }
			}
		], // Make sure this is alphanumeric
		bex_level: { type: String, required: false },
		userData: { type: userData, required: true }
	},
	{ collection: 'users' }
);

// const User = mongoose.model('user', userSchema, 'users');

// module.exports = User;

module.exports = mongoose.model('user', userSchema);
