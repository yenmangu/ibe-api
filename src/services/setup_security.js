const xmlbuilder = require('xmlbuilder');

async function generateXMLSnippet(formData) {
	try {
		const root = xmlbuilder.create('setwrequest', {
			version: '1.0',
			encoding: 'ISO-8859-1',
			headless: true
		});

		// Add svs and pass attributes
		root.att('svs', `-v-10126j-v-${formData.game_code}`);
		root.att('pass', formData.dir_key);

		const usesets = root.ele('usesets').att('v', '7');
		usesets.ele('ubs', {
			val: formData.data.newEventUses === 'previous' ? 'p' : 'b'
		});

		const initsets = root.ele('initsets').att('v', '20');
		initsets.ele('popup', { val: formData.data.twoPageStartup ? 'y' : 'n' });
		initsets.ele('nidscr', { val: 'y' });
		initsets.ele('prenam', {
			val: formData.data.requireAllNames
				? 'f'
				: formData.data.tdEntersNames
				? 'y'
				: 'n'
		});
		initsets.ele('ttid', { val: formData.data.teamSignIn ? 'y' : 'n' });

		const secsets = root.ele('secsets').att('v', '4');
		switch (formData.data.onGameCreation) {
			case 'release-lock':
				secsets.ele('mlpc', { val: 'u' });
				break;
			case 'lock-event':
				secsets.ele('mlpc', { val: 'l' });
				break;
			case 'no-lock-change':
				secsets.ele('mlpc', { val: 'o' });
				break;
			default:
				secsets.ele('mlpc', { val: 'o' });
		}

		secsets.ele('pin', {
			on: formData.data.usePin ? 'y' : 'n',
			len: formData.data.pinLength,
			type:
				formData.data.pinType === 'alphanumeric'
					? 'an'
					: formData.data.pinType === 'alphabetic'
					? 'a'
					: 'n',
			case: formData.data.pinCasee
		});

		const spec = secsets.ele('spec');
		spec.att('web', formData.data.spectateWebsite ? 'y' : 'n');
		spec.att('app', formData.data.spectateApp ? 'y' : 'n');

		return root;
	} catch (error) {
		throw error;
	}
}
module.exports = { generateXMLSnippet };
