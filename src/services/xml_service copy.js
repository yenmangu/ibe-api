const xml2js = require('xml2js');
const xmlescape = require('xml-escape');
const xmlbuilder = require('xmlbuilder');

async function parseSfAttribute(xmlResponse) {
	try {
		const parser = new xml2js.Parser({ explicitArray: false, mergeAttrs: true });

		const parsedXml = await new Promise((resolve, reject) => {
			parser.parseString(xmlResponse, (err, result) => {
				if (err) {
					console.error('XML Parsing Error:', err); // Log parsing errors
					reject(err);
				} else {
					resolve(result);
				}
			});
		});
		// console.log('parsedXml: ', parsedXml)
		if (!parsedXml.siteauthresponse || !parsedXml.siteauthresponse.sf) {
			console.error('Missing sf attribute in parsed XML'); // Log if the attribute is missing
			return null; // Return null or a default value if attribute is missing
		}

		const sfValue = parsedXml.siteauthresponse.sf;
		return sfValue;
	} catch (error) {
		throw error;
	}
}

// Usage example:
// const sfValue = await parseSfAttribute(xmlResponse);
// console.log(`Value of 'sf' attribute: ${sfValue}`);

async function getMovementsData(xmlFile) {
	return new Promise((resolve, reject) => {
		xml2js.parseString(xmlFile, (err, result) => {
			if (err) {
				reject(err);
			} else {
				resolve(result);
			}
		});
	});
}
async function convertXMLtoJSON(xmlData) {
	try {
		const result = await getMovementsData(xmlData);
		const siteAuthResponse = result.siteauthresponse;

		// Convert each tag inside <siteauthresponse> to key-value pairs
		const jsonData = {};
		for (const key in siteAuthResponse) {
			if (siteAuthResponse.hasOwnProperty(key)) {
				const value = siteAuthResponse[key][0]; // Get the first (and only) value
				jsonData[key] = value;
			}
		}

		return jsonData;
	} catch (error) {
		throw error;
	}
}

const allowedCharacters = /^[a-zA-Z0-9_\-]+$/; // Define your allowed characters regex

function isValidName(name) {
	return allowedCharacters.test(name);
}

async function convertJSONtoXML(jsonData) {
	try {
		const root = xmlbuilder.create('playerdb', {
			version: '1.0',
			encoding: 'UTF-8',
			headless: true
		});
		root.att('rev', '84');

		jsonData.forEach(item => {
			console.log('item: ', item);
			if (item && item['$'] && item['$'].type) {
				const itemElement = root.ele('item', {
					type: item.$.type,
					n: item.$.n,
					adddate: item.$.adddate
				});
				itemElement.ele('name').cdata(item.name[0].trim());
				if (item.email) {
					itemElement.ele('email').cdata(item.email[0]);
				}
				if (item.telephone) {
					itemElement.ele('telephone').cdata(item.telephone[0]);
				}
				if (item.pp) {
					itemElement.ele('pp').cdata(item.pp[0].$.n);
				}
				if (item.lastplay) {
					itemElement.ele('lastplay').cdata(item.lastplay[0].$.date);
				}
				if (item.id) {
					if (Array.isArray(item.id)) {
						item.id.forEach(id => {
							itemElement.ele('id', {
								type: id.$.type,
								code: id.$.code
							});
						});
					}
				}
			} else {
				console.log('item with no type: ', item);
			}
		});
		return root.end({ pretty: true });
	} catch (err) {
		console.error('error converting JSON to XML: ', err);
	}
}

// redate request:
// "1.0" encoding="ISO-8859-1"?>
// <redaterequest svs="-v-10126j-v-teamdum" pass="cat" >
//  <redatestring><![CDATA[17 Oct 2023]]></redatestring>
// </redaterequest>

const elementMapping = {
	eventName: 'en',
	players: 'pn',
	team_name: 'tn',
	sides: 'sn',
	boardCol: 'colstxt',
	sitters: 'sittxt',
	hadicaps: 'handi',
	stratification: 'strattxt',
	venues: 'tbln',
	abbreviations: 'nkstxt',
	labels: 'tagstxt',
	adjustments: 'gradj',
	times: 'rdtstxt',
	lunch: 'lunchtxt'
};

async function createCurrentGameXML(dirKey, gameCode, formData) {
	try {
		// xml logic
		console.log('xml service invoked');
		for (const key in formData) {
			if (Array.isArray(formData[key])) {
				for (let i = 0; i < formData[key].length; i++) {
					if (
						formData[key][i] === null ||
						formData[key][i] === `${null} - ${null}`
					) {
						formData[key][i] = '';
					}
				}
			}
		}


		const builder = new xml2js.Builder({renderOpts:{pretty: true, allowEmpty: true } })

	// 	const root = {
	// 		gnvrequest: {
	// 			$: {
	// 				svs: `-v-10126j-v-${gameCode}`,
	// 				pass: `${dirKey}`
	// 			},
	// 			revs: {
	// 				$: {
	// 					grev: '200',
	// 					mrev: '-1',
	// 					nrev: '400',
	// 					rrev: '0'
	// 				}
	// 			}
	// 		}
	// 	}
	// 	for (const key in formData) {
	// 		if (elementMapping[key]) {
	// 				if (Array.isArray(formData[key])) {
	// 						root.gnvrequest[elementMapping[key]] = { _: '\n' };
	// 						const filteredData = formData[key].filter(value => value !== null);
	// 						if (filteredData.length > 0) {
	// 								root.gnvrequest[elementMapping[key]]._ = '\n' + filteredData.join('\n');
	// 						}
	// 				} else {
	// 						if (formData[key] !== null) {
	// 								root.gnvrequest[elementMapping[key]] = { _: formData[key] };
	// 						} else {
	// 								root.gnvrequest[elementMapping[key]] = { _: '\n' };
	// 						}
	// 				}
	// 		}
	// }
	// return builder.buildObject(root)

		const root = xmlbuilder.create('gnvrequest', {
			version: '1.0',
			encoding: 'UTF-8',
			headless: true
		});
		root.att('svs', `-v-10126j-v-${gameCode}`).att('pass', `${dirKey}`);
		root
			.ele('revs')
			.att('grev', '200')
			.att('mrev', '-1')
			.att('nrev', '400')
			.att('rrev', 0);

		// for (const key in formData) {
		// 	if (elementMapping[key]) {
		// 		const element = root.ele(elementMapping[key]);
		// 		if (Array.isArray(formData[key])) {
		// 			const filteredData = formData[key].filter(value => value !== null);
		// 			if (filteredData.length > 0) {
		// 				element.dat(filteredData[0]);
		// 				if (filteredData.length > 1) {
		// 					for (let i = 1; i < filteredData.length; i++) {
		// 						element.txt(`${filteredData[i]}`);
		// 					}
		// 				}
		// 			} else {
		// 				element.txt('\n');
		// 			}
		// 		} else {
		// 			if (formData[key] !== null) {
		// 				element.dat(`${formData[key]}`);
		// 			} else {
		// 				element.txt('\n');
		// 			}
		// 		}
		// 	}
		// }
		for (const key in formData){
			if(Array.isArray(formData[key])){
				for(leti=0; i<formData[key].length; i++){
					if(formData[key][i]=== null){
						
					}
				}
			}
		}

		return root.end({ pretty: true, allowEmpty: true });
	} catch (error) {
		throw error;
	}
}

module.exports = {
	parseSfAttribute,
	getMovementsData,
	convertXMLtoJSON,
	convertJSONtoXML,
	createCurrentGameXML
};
