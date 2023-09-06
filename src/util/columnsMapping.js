const mapPropertyNamesToColumnNames = (function (propertyNames) {
	const propertyMapping = {
		firstName: 'First Name',
		lastName: 'Last Name',
		type: 'Subscription Type',
		email: 'Email',
		internationalTelNumber: 'Telephone Number',
		gameCode: 'Game Code',
		country: 'Country',
		city: 'City',
		usage: 'Usage',
		howHeard: 'How did they hear',
		feedback: 'Feedback Choice',
		comments: 'Any comments'
	};

	return function (propertyNames) {
		return propertyNames.map(
			propertyName => propertyMapping[propertyName] || propertyName
		);
	};
})();

const keys = [
	'firstName',
	'lastName',
	'type',
	'email',
	'internationalTelNumber',
	'directorKey',
	'gameCode',
	'country',
	'city',
	'usage',
	'howHeard',
	'feedback',
	'comments'
];

// function newReadableMapping(data) {
// 	return {
// 		'First Name': data.firstName,
// 	'Last Name': data.lastName,
// 	'Subscription Type': data.type,
// 	'Email': data.email,
// 	'Telephone Number': data.internationalTelNumber,
// 	'Director Key': data.directorKey,
// 	'Game Code': data.,
// 	'Country': 'H',
// 	'City': 'I',
// 	'Usage': 'J',
// 	'How did they hear': 'K',
// 	'Feedback Choice': 'L',
// 	'Any comments': 'M'
// 	}
// }

function mapDataWithMapping(data) {
	const mappedDataObject = {};
	const propertyMapping = {
		firstName: 'First Name',
		lastName: 'Last Name',
		type: 'Subscription Type',
		email: 'Email',
		internationalTelNumber: 'Telephone Number',
		directorKey: 'Director Key',
		gameCode: 'Game Code',
		country: 'Country',
		city: 'City',
		usage: 'Usage',
		howHeard: 'How did they hear',
		feedback: 'Feedback Choice',
		comments: 'Any comments',
		time: 'Time Stamp'
	};
	for (const key in data) {
		if (data.hasOwnProperty(key) && propertyMapping[key]) {
			mappedDataObject[propertyMapping[key]] = data[key];
		}
	}
	return mappedDataObject;
}

function mapToArray(mappedData) {
	return Object.keys(mappedData).map(key => ({
		[key]: mappedData[key]
	}));
}

// const humanReadableKeys = mapPropertyNamesToColumnNames(keys);
// console.log(humanReadableKeys);

module.exports = {
	mapDataWithMapping,
	mapPropertyNamesToColumnNames,
	mapToArray
};
