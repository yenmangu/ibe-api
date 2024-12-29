function changeFileExtension(filename, newExtension) {
	const parts = filename.split('.');
	parts[parts.length - 1] = newExtension;
	return parts.join('.');
}
module.exports = { changeFileExtension };
