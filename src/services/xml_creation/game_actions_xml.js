const { create } = require('xmlbuilder2');

async function writeGameActions(data, action) {
	try {
		console.log('initial data: ', data)
		const { gameCode, dirKey: directorKey } = data;
		console.log('action: ', action);

		console.log('data: ', data);
		// return
		const xmlObject ={
		}
		// create({version: '1.0', encoding: 'ISO-8859-1'});

		if (action === 'redate') {
			const { date } = data;
			xmlObject.redaterequest = {
				'@svs': `-v-10126j-v-${gameCode}`,
				'@pass': `${directorKey}`
			};
			xmlObject.redaterequest.redatestring = date;
		}

		if (action === 'merge') {
			xmlObject.parawrequest = {
				'@svs': `-v-10126j-v-${gameCode}`,
				'@pass': `${directorKey}`
			};
			if (data.simultaneous === '') {
				xmlObject.parawrequest.parastring = '';
			} else {
				xmlObject.parawrequest.parastring = data.simultaneous;
			}
		}

		console.log(JSON.stringify(xmlObject, null, 2));

		const xml = create(xmlObject);
		console.log(xml.toString());
		// return
		const final = xml.end({ prettyPrint: true });
		console.log('final: ', final);

		return final;
	} catch (error) {
		throw error;
	}
}
module.exports = { writeGameActions };
