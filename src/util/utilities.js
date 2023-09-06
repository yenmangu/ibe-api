function nameRetriever(object, keysToUse) {
	Object.keys(object);
}

const filterKeys = ['firstName', 'lastName'];

function getSpecifiedKeys(obj, keys) {
	const result = {};
	keys.forEach(key => {
		if (obj.hasOwnProperty(key)) {
			result[key] = obj[key];
		}
	});
	return result;
}

module.exports = {
	nameRetriever,
	getSpecifiedKeys
};
