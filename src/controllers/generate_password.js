function generatePassword (){
	const characters =
	'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
let pass = '';

for (let i = 0; i < 4; i++) {
	const randomIndex = Math.floor(Math.random() * characters.length);
	pass += characters[randomIndex];
}

return pass;
}

module.exports = generatePassword