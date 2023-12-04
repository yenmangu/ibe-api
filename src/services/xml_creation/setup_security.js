const xmlbuilder = require('xmlbuilder');
const { create } = require('xmlbuilder2');

async function generateNewXml(jsonData) {
	try {
		console.log('formdata: ', JSON.stringify(jsonData, null, 2));
		const gameCode = jsonData.game_code;
		const dirKey = jsonData.dir_key;

		const {
			data: { formData: settings, playerIdForm }
		} = jsonData;

		console.log('playerIdForm in function: ', playerIdForm);

		let xmlObject = {};

		let setwrequest = {};

		let usesets = {};
		let initsets = {};
		let secsets = {};

		usesets = {
			'@v': '7',
			ubs: {
				'@val': settings.newEventUses === 'previous' ? 'p' : 'b'
			}
		};

		initsets = {
			'@v': '200'
		};
		// initsets.ims = {
		// 	im: {
		// 		'@type': 'playername',
		// 		'@pref': 'y'
		// 	}
		// };
		initsets.popup = {
			'@val': jsonData.data.formData.twoPageStartup ? 'y' : 'n'
		};
		initsets.nidscr = { '@val': 'y' };
		initsets.prenam = {
			'@val': settings.requireAllNames ? 'f' : settings.tdEntersNames ? 'y' : 'n'
		};
		initsets.ttid = {
			'@val': settings.teamSignIn ? 'y' : 'n'
		};

		let imDataArray = [];
		let defaultName = {};
		if (playerIdForm.defaultNames) {
			let im = { '@type': 'playername', '@pref': 'y' };
			imDataArray.push(im);
		} else {
			let im = { '@type': 'playername' };
			imDataArray.push(im);
		}
		if (playerIdForm.defaultNames) {
			defaultName = { '@type': 'playername', '@pref': 'y' };
		} else {
			defaultName = { '@type': 'playername' };
		}

		playerIdForm.choices.forEach(choice => {
			let idAttribute = '';
			let native = choice.selectedOrganisation === 'nativeclub';
			let im = {};

			if (native) {
				im = {
					'@type': 'nativeclub'
				};
			} else {
				im = {
					'@type': 'id',
					'@fid': choice.selectedOrganisation
				};
			}
			if (choice.setDefault) {
				im['@pref'] = 'y';
			}

			imDataArray.push(im);
		});

		const ims = {
			im: imDataArray
		};

		initsets.ims = ims;

		let mlpcVal = '';

		switch (settings.onGameCreation) {
			case 'release-lock':
				mlpcVal = 'u';
				console.log('release lock detected, setting value to "u" ');
				break;
			case 'lock-event':
				mlpcVal = 'l';
				console.log('lock event detected, setting value to "l" ');
				break;
			case 'no-lock-change':
				mlpcVal = 'o';
				console.log('no lock change detected, setting value to "o" ');
				break;
			default:
				mlpcVal = 'o';
				console.log('no value detected, setting value to "o" ');
		}
		secsets = {
			'@v': '131',
			mlpc: { '@val': mlpcVal },
			pin: {
				'@on': settings.usePin ? 'y' : 'n',
				'@len': settings.pinLength,
				'@type':
					settings.pinType === 'alphanumeric'
						? 'an'
						: settings.pinType === 'alphabetic'
						? 'a'
						: 'n',
				'@case': settings.pinCase ? settings.pinCase : 'c'
			},
			spec: {
				'@web': settings.spectateWeb === true ? 'y' : 'n',
				'@app': settings.spectateApp === true ? 'y' : 'n'
			}
		};

		setwrequest = {
			'@svs': `-v-10126j-v-${gameCode}`,
			'@pass': `${dirKey}`
		};

		setwrequest.usesets = usesets;
		setwrequest.initsets = initsets;
		setwrequest.secsets = secsets;

		xmlObject.setwrequest = setwrequest;

		xml = create(xmlObject);
		console.log(
			'\n\n\n ------***------ NEW XML -----***----- \n \n ',
			xml.toString()
		);
		return xml;
	} catch (error) {
		console.error('error writing main xml', error);
		throw error;
	}
}

async function generateInitSetsXml(jsonData) {
	try {
		console.log(JSON.stringify('raw data in function: ', jsonData, null, 2));

		const {
			jsonData: {
				data: { formdata: settings }
			}
		} = data;

		console.log('settings: ', settings);

		const xmlObject = {
			setwrequest: {
				'@version': 1.0,
				'@encoding': 'ISO-8859-1',
				'@svs': `-v-10126j-v${jsonData.game_code}`,
				'@pass': jsonData.dir_key
			}
		};
		const { setwrequest } = xmlObject;

		setwrequest.initsets = {
			'@v': '139'
		};
		setwrequest.initsets.ims = {
			im: {
				'@type': 'playername',
				'@pref': 'y'
			}
		};
		setwrequest.initsets.popup = {
			'@val': jsonData.data.formData.twoPageStartup ? 'y' : 'n'
		};
		setwrequest.initsets.nidscr = { '@val': 'y' };
		setwrequest.initsets.prenam = {
			'@val': settings.requireAllNames ? 'f' : settings.tdEntersNames ? 'y' : 'n'
		};
		setwrequest.initsets.ttid = {
			'@val': settings.teamSignIn ? 'y' : 'n'
		};

		const xml = create(xmlObject);

		return xml;
	} catch (error) {
		console.error('Error writing initial settings to XML', error);
		throw error;
	}
}

async function generateSecurityXML(jsonData) {
	try {
		const {
			jsonData: {
				data: { formdata: settings }
			}
		} = data;

		const xmlObject = {
			setwrequest: {
				'@version': 1.0,
				'@encoding': 'ISO-8859-1',
				'@svs': `-v-10126j-v${jsonData.game_code}`,
				'@pass': jsonData.dir_key
			}
		};
		const { setwrequest } = xmlObject;
		let mlpcVal = '';

		switch (settings.onGameCreation) {
			case 'release-lock':
				mlpcVal = 'u';
				console.log('release lock detected, setting value to "u" ');
				break;
			case 'lock-event':
				mlpcVal = 'l';
				console.log('lock event detected, setting value to "l" ');
				break;
			case 'no-lock-change':
				mlpcVal = 'o';
				console.log('no lock change detected, setting value to "o" ');
				break;
			default:
				mlpcVal = 'o';
				console.log('no value detected, setting value to "o" ');
		}
		const secsets = {
			'@v': '131',
			mlpc: { '@val': mlpcVal },
			pin: {
				'@on': settings.usePin ? 'y' : 'n',
				'@len': settings.pinLength,
				'@type':
					settings.pinType === 'alphanumeric'
						? 'an'
						: settings.pinType === 'alphabetic'
						? 'a'
						: 'n'
			},
			spec: {
				'@web': settings.spectateWeb === true ? 'y' : 'n',
				'@app': settings.spectateApp === true ? 'y' : 'n'
			}
		};
		const xml = create(xmlObject);
		return xml;
	} catch (error) {
		console.error('error writing security xml settings');
		throw error;
	}
}

// async function gnerateUseSetsXml(jsonData){
// 	try {

// 		const xmlObject = {
// 			setwrequest :{
// 				'@version': 1.0,
// 				'@encoding': 'ISO-8859-1',
// 				'@svs': `-v-10126j-v${jsonData.game_code}`,
// 				'@pass': jsonData.dir_key
// 			}
// 		}

// 		const {setwrequest} = xmlObject

// 		setwrequest.secsets ={
// 			'@v':'126'
// 		}

// 		// setwrequest.secsets.mlpc

// 	} catch (error) {
// 		console.error('Error writing security settings', error)
// 	}
// }

async function generateXMLSnippet(formData) {
	try {
		console.log(
			'\n\nraw data in function: ',
			JSON.stringify(formData, null, 2),
			'\n\n'
		);

		const root = xmlbuilder.create('setwrequest', {
			version: '1.0',
			encoding: 'ISO-8859-1',
			headless: true
		});
		const { game_code, dir_key } = formData;

		// Add svs and pass attributes
		root.att('svs', `-v-10126j-v-${game_code}`);
		root.att('pass', dir_key);

		const {
			data: { formData: settings }
		} = formData;
		console.log('settings as destructured: ', settings);

		const usesets = root.ele('usesets').att('v', '7');
		usesets.ele('ubs', {
			val: settings.newEventUses === 'previous' ? 'p' : 'b'
		});

		const initsets = root.ele('initsets').att('v', '20');
		initsets.ele('popup', {
			val: formData.data.formData.twoPageStartup ? 'y' : 'n'
		});
		initsets.ele('nidscr', { val: 'y' });
		initsets.ele('prenam', {
			val: settings.requireAllNames ? 'f' : settings.tdEntersNames ? 'y' : 'n'
		});
		initsets.ele('ttid', { val: settings.teamSignIn ? 'y' : 'n' });
		// console.log('formdata.ongamecreation: ',settings);

		const secsets = root.ele('secsets').att('v', '4');
		switch (settings.onGameCreation) {
			case 'release-lock':
				secsets.ele('mlpc', { val: 'u' });
				console.log('release lock detected, setting value to "u" ');
				break;
			case 'lock-event':
				secsets.ele('mlpc', { val: 'l' });
				console.log('lock event detected, setting value to "l" ');
				break;
			case 'no-lock-change':
				secsets.ele('mlpc', { val: 'o' });
				console.log('no lock change detected, setting value to "o" ');
				break;
			default:
				secsets.ele('mlpc', { val: 'o' });
				console.log('no value detected, setting value to "o" ');
		}

		secsets.ele('pin', {
			on: settings.usePin ? 'y' : 'n',
			len: settings.pinLength,
			type:
				settings.pinType === 'alphanumeric'
					? 'an'
					: settings.pinType === 'alphabetic'
					? 'a'
					: 'n',
			case: settings.pinCase
		});

		const spec = secsets.ele('spec');
		spec.att('web', settings.spectateWeb === true ? 'y' : 'n');
		spec.att('app', settings.spectateApp === true ? 'y' : 'n');

		return root;
	} catch (error) {
		throw error;
	}
}
module.exports = {
	generateNewXml,
	generateXMLSnippet,
	generateInitSetsXml,
	generateSecurityXML
};
