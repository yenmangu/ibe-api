const xmlbuilder = require('xmlbuilder');

async function writeNamingNumberingXML(data) {
	try {
		const formData = data.data;
		const root = xmlbuilder.create('setwrequest', {
			version: '1.0',
			encoding: 'ISO-8859-1'
		});
		// console.log('data in naming numbering', data);

		root.dec({ version: '1.0', encoding: 'ISO-8859-1', headless: true });
		root.att('svs', `-v-10126j-v-${data.game_code}`).att('pass', `${data.dir_key}`);
		const namsets = root.ele('namsets').att('v', '3');

		const fieldToElementMapping = {
			mitchellEWNumbers: 'mn',
			tableNaming: 'stn',
			shortenPlayerNames: 'sh',
			defaultNameStyle: 'dpn'
		};

		function findXMLValue(mapping, field, value) {
			const config = mapping.find(entry => entry[field]);
			if (config) {
				const valueMapping =
					config[field].mitchelNumberArray ||
					config[field].tableNamingConfigArray ||
					config[field].shortenPlayerNamesArray ||
					config[field].defaultNameArray;
				const match = valueMapping.find(item => item.value === value);
				if (match) {
					return match.xmlValue;
				}
			}
			return '';
		}
		Object.keys(fieldToElementMapping).forEach(field => {
			const xmlValue = findXMLValue(
				tableNumberingMapping,
				field,
				formData.formData[field]
			);
			const mapping = tableNumberingMapping.find(mapping => mapping[field]);
			if (mapping) {
				namsets.ele(mapping[field].xmlElement, { val: xmlValue });
			}
		});

		return root.end({ pretty: true });
	} catch (error) {
		throw error;
	}
}

const tableNumberingMapping = [
	{
		mitchellEWNumbers: {
			xmlElement: 'mn',
			mitchelNumberArray: [
				{ display: 'Add at least ten', value: 'add_10', xmlValue: '10' },
				{ display: 'Add at least twenty', value: 'add_20', xmlValue: '20' },
				{ display: 'Take table number', value: 'table_number', xmlValue: 't' },
				{ display: 'Follow on from N/S', value: 'follow_ns', xmlValue: 'n' }
			]
		}
	},
	{
		tableNaming: {
			xmlElement: 'stn',
			tableNamingConfigArray: [
				{ display: '1A-8A, 1B-8B etc', value: 'a', xmlValue: 'a' },
				{
					display: 'Add at least ten per section, start from 1',
					value: 'from_1',
					xmlValue: '1'
				},
				{
					display: 'Add at least ten per section, start from 11',
					value: 'from_11',
					xmlValue: '11'
				},
				{ display: 'Strictly sequntial', value: 'sequential', xmlValue: 's' }
			]
		}
	},
	{
		shortenPlayerNames: {
			xmlElement: 'sh',
			shortenPlayerNamesArray: [
				{ display: 'First names', value: 'first_names', xmlValue: 'f' },
				{ display: 'Last names', value: 'last_names', xmlValue: 'l' }
			]
		}
	},
	{
		defaultNameStyle: {
			xmlElement: 'dpn',
			defaultNameArray: [
				{
					display: 'Historical Figures',
					value: 'historical_figures',
					xmlValue: '0'
				},
				{
					display: 'U.S. Presidents & Spouses',
					value: 'presidents_spouses',
					xmlValue: '2'
				},
				{ display: 'Greek Goddesses', value: 'greek_goddesses', xmlValue: '3' },
				{
					display: "'Tap to select/Long-press to edit'",
					value: 'tap',
					xmlValue: '1'
				}
			]
		}
	}
];

module.exports = { writeNamingNumberingXML };
