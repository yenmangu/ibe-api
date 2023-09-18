// Turn data into useable string for Victor

function transformData(user) {
	const {
		full_name,
		email,
		tel_phone,
		user_name,
		password,
		country,
		type,
		bex_level
	} = user;

	const trial = 'trial';
	const name = full_name.split(' ').join(' ');
	const phone = tel_phone;
	const account_name = user_name;
	const country_formatted =
		country === 'Northern Ireland' ? 'NI' : country.substring(0, 3);
	const bex_type =
		bex_level === 'bexbronze'
			? 'bexbronze'
			: bex_level === 'bexgold'
			? 'bexgold'
			: 'bexsilver';

	return `${trial}\n${name}\n${email}\n${phone}\n${account_name}\n${country_formatted}\n${bex_type}`;
}

module.exports = transformData