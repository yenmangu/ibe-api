const { create } = require('xmlbuilder2');

async function writeAppInterfaceXML(data) {
	try {
		console.log('\n\nraw data in function: ', JSON.stringify(data, null, 2), '\n\n');

		// Its a suprise tool that will help us later
		function mapResultsAttribute(ownResults, othersResults) {
			if (ownResults && othersResults) {
				return 'y';
			} else if (ownResults && !othersResults) {
				return 'o';
			} else {
				return 'n';
			}
		}
		// console.log('initial data in app int.: ', JSON.stringify(data, null, 2));
		const elements = [
			{
				elementName: 'pcsee',
				attributes: ['hands', 'results', 'rankings', 'asd']
			},
			{
				elementName: 'flash',
				attributes: ['val']
			},
			{
				elementName: 'tos',
				attributes: ['val']
			},
			{
				elementName: 'pcchg',
				attributes: ['dan', 'pn', 'tsn', 'rcr']
			},
			{
				elementName: 'qaba',
				attributes: ['val']
			},
			{
				elementName: 'pci',
				attributes: ['leads', 'auctions', 'deals', 'notes']
			},
			{
				elementName: 'warn',
				attributes: ['sw', 'sh', 'oo', 'un', 'nn']
			},
			{
				elementName: 'scov',
				attributes: ['val']
			}
		];

		const formData = data.data.formData;

		console.log('\n ---------- formData: ----------\n', formData);

		const xmlObject = {
			setwrequest: {
				'@version': '1.0',
				'@encoding': 'ISO-8859-1',
				'@svs': `-v-10126j-v-${data.game_code}`,
				'@pass': data.dir_key,
				pluisets: {
					'@v': '13'
				}
			}
		};

		// start the outer loop
		elements.forEach(element => {
			// console.log(
			// 	'\n++++++ STARTING MAIN LOOP FOR ELEMENT: ',
			// 	element,
			// 	' ++++++\n'
			// );

			// destructure
			const { elementName, attributes } = element;
			if (elementName === 'pcchg') {
				console.log('\n + + + + ELEMENT NAME === PCCHG \n');

				console.log('formdata players change: ', formData.playersChange);

				xmlObject.setwrequest.pluisets.pcchg = {
					'@dan': formData.playersChange[0].control0 === true ? 'y' : 'n',
					'@pn': formData.playersChange[1].control1 === true ? 'y' : 'n',
					'@tsn': formData.playersChange[2].control2 === true ? 'y' : 'n',
					'@rcr': formData.playersChange[3].control3 === true ? 'y' : 'n'
				};
				console.log('pcchg written: \n', xmlObject.setwrequest.pluisets.pcchg);
			}
			if (elementName === 'warn') {
				xmlObject.setwrequest.pluisets.warn = {
					'@sw': formData.warnPlayers[0].control0 === true ? 'y' : 'n',
					'@sh': formData.warnPlayers[1].control1 === true ? 'y' : 'n',
					'@oo': formData.warnPlayers[2].control2 === true ? 'y' : 'n',
					'@un': formData.warnPlayers[3].control3 === true ? 'y' : 'n',
					'@nn': formData.warnPlayers[4].control4 === true ? 'y' : 'n'
				};
				console.log('warn written: \n', xmlObject.setwrequest.pluisets.warn);
			}
			if (elementName === 'pci') {
				xmlObject.setwrequest.pluisets.pci = {
					'@leads':
						formData.playersInput[0].control0 === 'Yes'
							? 'y'
							: formData.playersInput[0].control0 === 'No'
							? 'n'
							: 'r',
					'@auctions':
						formData.playersInput[1].control1 === 'Yes'
							? 'y'
							: formData.playersInput[1].control1 === 'No'
							? 'n'
							: 'r',
					'@deals': formData.playersInput[2].control2 === 'Yes' ? 'y' : 'n',
					'@notes': formData.playersInput[3].control3 === 'Yes' ? 'y' : 'n'
				};
			}
			if (elementName === 'flash') {
				xmlObject.setwrequest.pluisets.flash = {
					'@val': formData.flash === true ? 'y' : 'n'
				};
			}
			if (elementName === 'qaba') {
				xmlObject.setwrequest.pluisets.qaba = {
					'@val': formData.qaba === true ? 'y' : 'n'
				};
			}
			if (elementName === 'scov') {
				xmlObject.setwrequest.pluisets.scov = {
					'@val': formData.scov === true ? 'y' : 'n'
				};
			}
			// if(elementName === '')
			// skip the pcsee to handle later
			if (elementName === 'pcsee') {
				// const formGroup = xmlElement.formGroup;

				// console.log('processing "pcsee" ');

				const resultsAttribute = mapResultsAttribute(
					formData.ownResults,
					formData.othersResults
				);

				xmlObject.setwrequest.pluisets.pcsee = {
					'@hands': formData.handDiagrams ? 'y' : 'n',
					'@results': resultsAttribute,
					'@rankings': formData.rankings ? 'y' : 'n',
					'@asd': formData.adjustedScores ? 'y' : 'n'
				};
			} else if (elementName === 'tos') {
				const timeout = formData.resultsTimeout.toString();
				xmlObject.setwrequest.pluisets.tos = {
					'@val': timeout
				};
			}
		});

		console.log('\n\nfinal xmlObject: ', xmlObject);
		console.log('\n\nfinal xmlObject: ', JSON.stringify(xmlObject, null, 2));

		const xml = create(xmlObject);

		console.log('final appInterfaceXML: ', xml.toString());
		// return;
		return xml;
	} catch (error) {
		throw error;
	}
}

const appInterfaceMapping = [
	{
		formGroup: 'resultsTimeout',
		xmlElement: 'tos',

		controls: [
			{
				name: 'resultsTimeout',
				xml: 'tos'
			}
		]
	},
	{
		formGroup: 'handDiagrams',
		xmlElement: 'pcsee',
		attribute: 'hands',
		controls: [
			{
				name: 'handDiagrams',
				xml: 'hands'
			}
		]
	},
	{
		formGroup: 'ownResults',
		xmlElement: 'pcsee',
		attribute: 'results',

		controls: [
			{
				name: 'ownResults',
				xml: 'results'
			}
		]
	},
	{
		formGroup: 'othersResults',
		xmlElement: 'pcsee',
		attribute: 'results',

		controls: [
			{
				name: 'othersResults',
				xml: 'results'
			}
		]
	},
	{
		formGroup: 'rankings',
		xmlElement: 'pcsee',
		controls: [
			{
				name: 'rankngs',
				xml: 'rankings'
			}
		]
	},
	{
		formGroup: 'adjustedScores',
		xmlElement: 'pcsee',
		controls: [
			{
				name: 'adjustedScore',
				xml: 'asd'
			}
		]
	},
	{
		formGroup: 'playersChange',
		xmlElement: 'pcchg',
		controls: [
			{
				control0: true,
				name: 'device-assign',
				xml: 'dan'
			},
			{
				control1: false,
				name: 'player-names',
				xml: 'pn'
			},
			{
				control2: false,
				name: 'team-names',
				xml: 'tsn'
			},
			{
				control3: false,
				name: 'resultsCurrentRound',
				xml: 'rcr'
			}
		]
	},

	{
		formGroup: 'playersInput',
		xmlElement: 'pci',
		controls: [
			{
				control0: false,
				name: 'leads',
				xml: 'leads'
			},
			{
				control1: false,
				name: 'auctions',
				xlm: 'auctions'
			},
			{
				control2: false,
				name: 'deals',
				xml: 'deals'
			},
			{
				control3: false,
				name: 'notes',
				xml: 'notes'
			}
		]
	},
	// {
	// 	formGroup: 'additionalConfig',
	// 	xmlElement: null,
	// 	controls: [
	// 		{ control0: false, name: 'flash-scores', xml: 'flash' },
	// 		{ control1: false, name: 'quick-adjust', xml: 'qaba' },
	// 		{ control2: false, name: 'opps-verification', xml: 'scov' }
	// 	]
	// },
	{
		formGroup: 'flash',
		xmlElement: 'flash',
		controls: [
			{
				name: 'flash',
				xml: 'flash'
			}
		]
	},
	{
		formGroup: 'qaba',
		xmlElement: 'qaba',
		controls: [
			{
				name: 'qaba',
				xml: 'qaba'
			}
		]
	},
	{
		formGroup: 'scov',
		xmlElement: 'scov',
		controls: [
			{
				name: 'scov',
				xml: 'scov'
			}
		]
	},
	{
		formGroup: 'warnPlayers',
		xmlElement: 'warn',
		controls: [
			{
				control0: false,
				name: 'statinary-switch',
				xml: 'sw'
			},
			{
				control1: false,
				name: 'share',
				xml: 'sh'
			},
			{
				control2: false,
				name: 'out-of-order',
				xml: 'oo'
			},
			{
				control3: false,
				name: 'unlikely-score',
				xml: 'un'
			},
			{
				control4: false,
				name: 'new-name',
				xml: 'nn'
			}
		]
	}
];

module.exports = { writeAppInterfaceXML };

// const root = create().ele('setwrequest', {
// 	version: '1.0',
// 	encoding: 'ISO-8859-1'
// });
// root.dec({ version: '1.0', encoding: 'ISO-8859-1', headless: true });
// root.att('svs', `-v-10126j-v-${data.game_code}`).att('pass', `${data.dir_key}`);

// const pluisets = root.ele('pluisets', { v: '13' });

// console.log('formData in app interface: ', formData);

// const mappingData = appInterfaceMapping;

// mappingData
// 	.filter(mapping => mapping.xmlElement !== 'pcsee')
// 	.forEach(mapping => {
// 		const { formGroup, xmlElement, controls } = mapping;
// 		if (formGroup === 'additionalConfig') {
// 			const additionalConfigElement = pluisets.ele(xmlElement);
// 			controls.forEach((control, index) => {
// 				const controlValue = formData[formGroup][index];
// 				const xmlAttr = control.xml;
// 				additionalConfigElement.att(xmlAttr, controlValue ? 'y' : 'n');
// 			});
// 		} else {
// 			const element = pluisets.ele(xmlElement);
// 			controls.forEach(control => {
// 				for (const key in control) {
// 					if (control[key] !== null) {
// 						if (formGroup === 'playersInput' && key in formData[formGroup]) {
// 							// Map "Yes", "No", "Required" to "y", "n", "r" respectively
// 							const value = control[key];
// 							const mappedValue =
// 								value === 'Yes' ? 'y' : value === 'No' ? 'n' : 'r';
// 							element.att(key, mappedValue);
// 						} else {
// 							element.att(key, control[key] ? 'y' : 'n');
// 						}
// 					}
// 				}
// 			});
// 		}
// 	});
