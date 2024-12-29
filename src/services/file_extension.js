function isValidExtension(extension) {
	const allowedExtensions = ['.dlm', '.dup', '.pbn'];
	return allowedExtensions.includes(extension);
}
function isValidExtensionLin(extension) {
	const allowedExtensions = ['.lin'];
	return allowedExtensions.includes(extension);
}

module.exports = {
	isValidExtension,
	isValidExtensionLin
};
``