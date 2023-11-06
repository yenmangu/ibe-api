const xmlbuilder = require('xmlbuilder');

async function createScoringXML(data) {
	try {
		const formData = data.data;

		console.log(JSON.stringify(formData.formData, null, 2));

		const root = xmlbuilder.create('setwrequest', {
			version: '1.0',
			encoding: 'ISO-8859-1',
			headless: true
		});

		root.dec({ version: '1.0', encoding: 'ISO-8859-1', headless: true });
		root.att('svs', `-v-10126j-v-${data.game_code}`).att('pass', `${data.dir_key}`);

		const scosets = root.ele('scosets', { v: '8' });
		const selectedEvent = boardsScoringData.find(event => event.defaultSelected);

		const pet = scosets.ele('pet', {
			val: getPetValue(formData.formData.scoringDataArray)
		});
		console.log('pet value: ', getPetValue(formData.formData.scoringDataArray));

		const pnt = scosets.ele('pnt', {
			val: getPntValue(formData)
		});

		const scms = scosets.ele('scms');
		for (let i = 0; i < formData.formData.scoringDataArray.length; i++) {
			const scm = scms.ele('scm', {
				for: boardsScoringData[i].petVal.toLowerCase(),
				type: getScoringMethodValue(
					formData.formData.scoringDataArray[i].scoringMethods
				),
				bds: getScoringDurationValue(
					formData.formData.scoringDataArray[i].preferredDuration
				)
			});
		}

		const neu = scosets.ele('neu', {
			val: getNeubergValue(formData.formData.neuberg)
		});

		console.log('xml element for scosets: ', root.toString());

		return root.toString({ pretty: true });
	} catch (error) {
		throw error;
	}
}
function getPntValue(formData) {
	return formData.formData.tables;
}

function getPetValue(scoringDataArray) {
	const selected = scoringDataArray.findIndex(
		data => data.defaultSelected === true
	);
	if (selected !== -1) {
		return boardsScoringData[selected].petVal;
	}
	return '';
}

function getScoringMethodValue(scoringMethods) {
	return scoringMethods;
}

function getScoringDurationValue(preferredDuration) {
	return preferredDuration;
}

function getNeubergValue(neuberg) {
	if (neuberg === 'interim') {
		return 'd';
	} else if (neuberg === 'final') {
		return 'e';
	} else if (neuberg === 'never') {
		return 'n';
	}
	return '';
}

// Scoring methods
const mp = { value: 'mp', display: 'Match Points' };
const ximp = { value: 'ximp', display: 'Cross IMPs' };
const ag = { value: 'ag', display: 'Aggregate' };
const bimp = { value: 'bimp', display: 'Butler IMPs' };
const imp = { value: 'imp', display: 'IMPs' };
const vpimp = { value: 'vpimp', display: 'IMPs ⇀ VPs' };
const mzp = { value: 'mzp', display: 'Point-a-board: -1 0 1' };
const ozt = { value: 'ozt', display: 'Point-a-board: 0 1 3' };
const pch = { value: 'pch', display: 'Pachabo' };
const ati = { value: 'ati', display: 'Add then IMP' };
const tol = { value: 'tol', display: 'Tollemache' };
const vpmp = { value: 'vpmp', display: 'Match Points ⇀ VPs' };

const normalDuration = [
	{ value: '8x12', display: '8-12 Boards' },
	{ value: '13x16', display: '13-16 Boards' },
	{ value: '15x18', display: '15-18 Boards' },
	{ value: '16x20', display: '16-20 Boards' },
	{ value: '18x21', display: '18-21 Boards' },
	{ value: '20x22', display: '20-22 Boards' },
	{ value: '22x25', display: '22-25 Boards' },
	{ value: '24x26', display: '24-26 Boards' },
	{ value: '25x27', display: '25-27 Boards' },
	{ value: '26x28', display: '26-28 Boards' },
	{ value: '28x30', display: '28-30 Boards' },
	{ value: '30x33', display: '30-33 Boards' },
	{ value: '33x36', display: '33-36 Boards' },
	{ value: '36x40', display: '36-40 Boards' }
];

const swissDuration = [
	{ value: '5x5', display: '5 Boards x 5' },
	{ value: '6x5', display: '6 Boards x 5' },
	{ value: '5x6', display: '5 Boards x 6' },
	{ value: '6x6', display: '6 Boards x 6' },
	{ value: '7x6', display: '7 Boards x 6' },
	{ value: '6x7', display: '6 Boards x 7' },
	{ value: '7x7', display: '7 Boards x 7' },
	{ value: '5x7', display: '5 Boards x 7' },
	{ value: '7x5', display: '7 Boards x 5' },
	{ value: '8x6', display: '8 Boards x 6' },
	{ value: '6x8', display: '6 Boards x 8' },
	{ value: '8x7', display: '8 Boards x 7' },
	{ value: '7x8', display: '7 Boards x 8' },
	{ value: '8x8', display: '8 boards x 8' }
];

const boardsScoringData = [
	{
		eventType: 'Pairs',
		petVal: 'p',
		defaultSelected: false,
		preferredDuration: normalDuration,
		scoringMethods: [mp, ximp, ag, bimp]
	},
	{
		eventType: 'Teams of four',
		petVal: 't',
		defaultSelected: false,
		preferredDuration: normalDuration,
		scoringMethods: [imp, vpimp, ag, mzp, ozt, pch]
	},
	{
		eventType: 'Teams of 8',
		petVal: '8',
		defaultSelected: false,
		preferredDuration: normalDuration,
		scoringMethods: [imp, ag, mzp, ozt, tol, ati]
	},
	{
		eventType: 'Teams of 12',
		petVal: '12',
		defaultSelected: false,
		preferredDuration: normalDuration,
		scoringMethods: [imp, ag, mzp, ozt, tol, ati]
	},
	{
		eventType: 'Teams of 16',
		petVal: '16',
		defaultSelected: false,
		preferredDuration: normalDuration,
		scoringMethods: [imp, ag, mzp, ozt, tol, ati]
	},
	{
		eventType: 'Individual',
		petVal: 'i',
		defaultSelected: false,
		preferredDuration: normalDuration,
		scoringMethods: [ximp, ag, bimp]
	},
	{
		eventType: 'Swiss Pairs',
		petVal: 'sp',
		defaultSelected: false,
		preferredDuration: swissDuration,
		scoringMethods: [mp, vpmp, ximp, ag, bimp]
	},
	{
		eventType: 'Swiss Teams',
		petVal: 'st',
		defaultSelected: false,
		preferredDuration: swissDuration,
		scoringMethods: [imp, vpimp, ag, ozt, mzp, pch]
	}
];

module.exports = { createScoringXML };
