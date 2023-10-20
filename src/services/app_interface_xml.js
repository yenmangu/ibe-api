const xmlbuilder = require('xmlbuilder');

async function writeAppInterfaceXML(data) {
	try {
		const formData = data.data;
		const root = xmlbuilder.create('setwrequest', {
			version: '1.0',
			encoding: 'ISO-8859-1'
		});
		root.dec({ version: '1.0', encoding: 'ISO-8859-1', headless: true });
		root.att('svs', `-v-10126j-v-${data.game_code}`).att('pass', `${data.dir_key}`);

		const pluisets = root.ele('pluisets', { v: '13' });
		const controls = [
			{
				elementName: 'pcsee',
				subElements: ['hands', 'results', 'rankings', 'asd'],
				additionalControl: 'flash'
			},
			{
				elementName: 'tos',
				subElements: []
			},
			{
				elementName: 'pcchg',
				subElements: ['dan', 'pn', 'tsn', 'rcr'],
				additionalControl: 'qaba'
			},
			{
				elementName: 'pci',
				subElements: ['leads', 'auctions', 'deals', 'notes']
			},
			{
				elementName: 'warn',
				subElements: ['sw', 'sh', 'oo', 'un', 'nn'],
				additionalControl: 'scov'
			}
		];
		controls.forEach(control => {
			const element = pluisets.ele(control.elementName);

			control.subElements.forEach(subElement => {
				const controlValue = formData.formData[subElement];
				element.att(subElement, controlValue ? 'y' : 'n');
			});

			if (control.additionalControl) {
				const additionalControl = formData.formData[control.additionalControl];
				pluisets
					.ele(control.additionalControl)
					.att('val', additionalControl ? 'y' : 'n');
			}
		});

		return root;
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
		formGroup: 'PlayersChange',
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
				control0: null,
				name: 'leads',
				xml: 'leads'
			},
			{
				control1: null,
				name: 'auctions',
				xlm: 'auctions'
			},
			{
				control2: null,
				name: 'deals',
				xml: 'deals'
			},
			{
				control3: null,
				name: 'notes',
				xml: 'notes'
			}
		]
	},
	{
		formGroup: 'additionalConfig',
		xmlElement: null,
		controls: [
			{ control0: false, name: 'flash-scores', xml: 'flash' },
			{ control1: false, name: 'quick-adjust', xml: 'qaba' },
			{ control1: false, name: 'opps-verification', xml: 'scov' }
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
