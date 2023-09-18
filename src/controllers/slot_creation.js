function generateSlot() {
	const characters =
		'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	let slot = '';

	for (let i = 0; i < 8; i++) {
		const randomIndex = Math.floor(Math.random() * characters.length);
		slot += characters[randomIndex];
	}

	return slot;
}

// const randomCode = generateSlot();
// console.log(randomCode);
module.exports = generateSlot;
