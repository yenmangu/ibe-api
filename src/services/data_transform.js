const timeConversion = require('./time_conversion');

function extractCardinalPlayers(formData) {
	const tempResult = {
		sides: [],
		pairConfig: []
	};

	for (const key in formData) {
		if (formData.hasOwnProperty(key)) {
			if (key.startsWith('sideLabel')) {
				tempResult.sides.push(formData[key]);
			} else {
				const table = formData[key];
				if (typeof table === 'object') {
					for (const tableKey in table) {
						if (table.hasOwnProperty(tableKey)) {
							if (!tempResult[tableKey]) {
								tempResult[tableKey] = [];
							}
							tempResult[tableKey].push(table[tableKey]);
							if (tableKey === 'nsPairs') {
								const pairNumber = table[tableKey];

								const ns = `${table.north} & ${table.south}`;
								// const ew = `${table[east]} & ${table[west]}`;
								tempResult.pairConfig.push({ [pairNumber]: ns });
							}
							if (tableKey === 'ewPairs') {
								const pairNumber = table[tableKey];

								const ew = `${table.east} & ${table.west}`;
								tempResult.pairConfig.push({ [pairNumber]: ew });
							}
						}
					}
				}
			}
		}
	}
	const result = {};
	if (result.sides) {
		result.sides = tempResult.sides;
	}
	result.venues = tempResult.venues;
	result.strat = tempResult.ns_stratification.concat(tempResult.ew_stratification);
	result.adjustments = tempResult.ns_adjustments.concat(tempResult.ew_adjustments);
	result.handicaps = tempResult.ns_handicaps.concat(tempResult.ew_handicaps);
	result.labels = tempResult.ns_labels.concat(tempResult.ew_labels);
	result.abbreviations = tempResult.ns_abbrev.concat(tempResult.ew_abbrev);
	result.nsPlayers = tempResult.north.concat(tempResult.south);
	result.ewPlayers = tempResult.east.concat(tempResult.west);
	result.pairConfig = tempResult.pairConfig.sort(
		(a, b) => Object.keys(a)[0] - Object.keys(b)[0]
	);
	console.log('Temp Result: ', tempResult);

	let tempSitters = [];
	tempSitters = tempResult.ns_sitters.concat(tempResult.ew_sitters);
	result.sitters = tempSitters.map(value => (value === true ? 'y' : ''));

	console.log('Sitters: ', result.sitters);

	// Object.keys(tempSitters).forEach(key => {
	// 	sitters[key] = tempSitters[key] ? 'y' : '';
	// });
	// result.sitters = sitters;

	const tableTotal = tempResult.north.length;
	let timeFrom = [];
	let timeTo = [];
	let timesArray = [];
	tempResult.time_from.forEach(time => {
		const convertedTime = timeConversion.convertTime(time);
		timeFrom.push(convertedTime);
	});
	tempResult.time_to.forEach(time => {
		const convertedTime = timeConversion.convertTime(time);
		timeTo.push(convertedTime);
	});

	let playerList = [];
	result.pairConfig.forEach(pair => {
		playerList.push(Object.values(pair)[0]);
	});
	result.playerList = playerList;

	console.log(result.playerList);

	let nsArray = [];
	let ewArray = [];

	for (let i = 0; i < tableTotal; i++) {
		nsArray.push(`${tempResult.north[i]} & ${tempResult.south[i]}`);
		ewArray.push(`${tempResult.east[i]} & ${tempResult.west[i]}`);
		timesArray.push(`${timeFrom[i]} - ${timeTo[i]}`);
	}
	result.players = nsArray.concat(ewArray);
	result.times = timesArray;
	if (result.team_name) {
		result.team_name = tempResult.team_name;
	}
	// console.log('after transform: ', result);
	return result;
}
module.exports = { extractCardinalPlayers };

// const nsPairNumbering = {};
// const ewPairNumbering = {};

// if (tableKey === 'nsPairs') {
// 	const ns = `${table.north} & ${table.south}`;
// 	nsPairNumbering[tableKey] = ns;
// }

// if (
// 	tableKey === 'north' ||
// 	tableKey === 'south' ||
// 	tableKey === 'east' ||
// 	tableKey === 'west'
// ) {
// 	nsPairNumbering
// }
