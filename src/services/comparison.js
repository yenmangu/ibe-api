exports.compareChangedValues = async (changedFields) => {
	try {
		if (!changedFields) {
			throw new Error('No values provided to comparison service');
		}

		const tables = Object.keys(changedFields)
		changedFields.forEach(field => {
			
		});

	} catch (error) {
		throw error;
	}
};
