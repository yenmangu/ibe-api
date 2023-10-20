function generateUniqueId(length) {
	// const length = 8;
	const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

	let id = '';

	for (let i = 0; i < length; i++) {
		const randomIndex = Math.floor(Math.random() * charset.length);
		id += charset[randomIndex];
	}
	return id;
}
module.exports = generateUniqueId;
