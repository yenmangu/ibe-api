const xmlbuilder = require('xmlbuilder');

async function generateXMLSnippet(formData) {
	try {
		const root = xmlbuilder.create('setwrequest', {
			version: '1.0',
			encoding: 'ISO-8859-1',
			headless: true
		});
		const {game_code, dir_key}= formData

		// Add svs and pass attributes
		root.att('svs', `-v-10126j-v-${game_code}`);
		root.att('pass', dir_key);

		const {data:{formData: settings}} = formData
		// console.log('settings as destructured: ', settings);

		const usesets = root.ele('usesets').att('v', '7');
		usesets.ele('ubs', {
			val: settings.newEventUses === 'previous' ? 'p' : 'b'
		});

		const initsets = root.ele('initsets').att('v', '20');
		initsets.ele('popup', { val: formData.data.formData.twoPageStartup ? 'y' : 'n' });
		initsets.ele('nidscr', { val: 'y' });
		initsets.ele('prenam', {
			val: settings.requireAllNames
				? 'f'
				: settings.tdEntersNames
				? 'y'
				: 'n'
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
		spec.att('web', settings.spectateWebsite ? 'y' : 'n');
		spec.att('app', settings.spectateApp ? 'y' : 'n');

		return root;
	} catch (error) {
		throw error;
	}
}
module.exports = { generateXMLSnippet };
