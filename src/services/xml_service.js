const xml2js = require('xml2js');
const xmlescape = require('xml-escape');
const xmlbuilder = require('xmlbuilder');
const { create } = require('xmlbuilder2');

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

function sanitiseXml(xml) {
	const xmlString = xml.trim();
	if (!xmlString.startsWith('<?xml')) {
		newXml = `<root>${xmlString}</root>`;
	}
	return xmlString;
}

async function getMovementsData(xmlFile) {
	xmlFile = sanitiseXml(xmlFile);
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

async function convertResponse(xmlData) {
	try {
		// console.log('string xml',xmlData.toString())
		const result = await getMovementsData(xmlData.trim());
		const firstProperty = Object.keys(result)[0];
		const jsonData = {};
		for (const key in firstProperty) {
			if (firstProperty.hasOwnProperty(key)) {
				const value = firstProperty[key][0];
				jsonData[key] = value;
			}
		}
		return jsonData;
	} catch (error) {
		throw error;
	}
}

async function convertXMLtoJSON(xmlData) {
	try {
		const result = await getMovementsData(xmlData);
		const siteAuthResponse = result.siteauthresponse;
		// console.log(
		// 	'\n------------------- xmlSettings: \n',
		// 	JSON.stringify(siteAuthResponse.xmlsettings, null, 2)
		// );
		// console.log('\n------------------- SiteAuthResponse: \n', siteAuthResponse);

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
	handicaps: 'handi',
	strat: 'strattxt',
	venues: 'tbln',
	abbreviations: 'nkstxt',
	labels: 'tagstxt',
	adjustments: 'gradj',
	times: 'rdtstxt',
	lunch: 'lunchtxt'
};

async function createCurrentGameXML(dirKey, gameCode, formData, eventName) {
	try {
		// xml logic
		console.log('xml service invoked');
		// console.log('formData in xmlService: ', formData)

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
		const root = xmlbuilder.create('gnvrequest', {
			version: '1.0',
			encoding: 'UTF-8',
			headless: true
		});
		root.dec({ version: '1.0', encoding: 'UTF-8' });
		root.att('svs', `-v-10126j-v-${gameCode}`).att('pass', `${dirKey}`);
		root
			.ele('revs')

			.att('grev', '200')
			.att('mrev', '-1')
			.att('nrev', '400')
			.att('rrev', 0);
		root.ele('en').dat(`${eventName}`);

		for (const key in formData) {
			if (elementMapping[key]) {
				const element = root.ele(elementMapping[key]);
				if (Array.isArray(formData[key])) {
					const filteredData = formData[key].filter(value => value !== null);
					if (filteredData.length > 0) {
						const dataWithNewLines = filteredData.join('\n');
						element.dat(`${dataWithNewLines}`);
					} else {
						element.txt('\n');
					}
				} else {
					if (formData[key] !== null) {
						element.dat(`${formData[key]}`);
					} else {
						element.txt('\n');
					}
				}
			}
		}

		return root.end({ pretty: true, allowEmpty: true });
	} catch (error) {
		throw error;
	}
}

function processArrays(array) {
	return array.join('\n');
}

// Add Player
async function writePlayerDb(param) {
	try {
		if (!param) {
			throw new Error('No data to process');
		}
		const {
			data: { value },
			gameCode,
			dirKey,
			dbRevision
		} = param;
		// const { value, gameCode, dirKey } = data;

		console.log('data in write playerDB: ', JSON.stringify(param, null, 2));

		console.log('value as in the request: ', JSON.stringify(value, null, 2));

		const { name: newName } = value;
		const newDate = value.$.adddate;
		const type = value.$.type;
		let ppArray;

		// const ppValues = value.pp

		console.log('name: ', newName, newDate);

		let email = '';
		let telephone = '';

		if (value.email) {
			email = value.email;
		}
		if (value.telephone) {
			telephone = value.telephone;
		}

		let idString = '';
		let idStringArray = [];
		let idArray = [];

		if (value.id) {
			value.id.forEach(id => {
				idArray.push(id['$']);
			});

			idArray.forEach(idElement => {
				const elString = `${idElement.type}:${idElement.code}`;
				idStringArray.push(elString);
			});
			idString = idStringArray.join(',');
			console.log('idString: ', idString);
		}

		const addString = `A ${newDate} ${newName}\nE em &${newName}&${
			email ? email : ''
		}\nE ph &${newName}&${telephone ? telephone : ''}\nE ids &${newName}&${
			idString ? idString : ''
		}`;

		const newRevision = +dbRevision + 1;

		const xmlObject = {
			pdwrequest: {
				'@svs': `-v-10126j-v-${gameCode}`,
				'@pass': `${dirKey}`,
				'@remrev': `${newRevision.toString()}`
			}
		};
		xmlObject.pdwrequest.pdwscript = {
			'@itemtype': `${type}`,
			'@adddate': `${newDate}`,
			$: addString
		};

		const xml = create(xmlObject);
		const final = xml.end({ prettyPrint: true });
		console.log('xml in process player data: ', final);
		// console.log('xml string: ', xml.toString());
		return final;
	} catch (error) {
		throw error;
	}
}

// edit player

async function updateDatabase(param) {
	console.log('data in update: ', JSON.stringify(param, null, 2));

	try {
		const {
			data: { value },
			existingName,
			gameCode,
			dirKey,
			dbRevision
		} = param;
		// const { value, gameCode, dirKey } = data;

		console.log('\n* * * * * * * * * current revision: ', dbRevision);
		let type;
		let adddate;

		if (value.$) {
			type = value.$.type;
			adddate = value.$.adddate;
		}

		let name;
		let pp;
		let email = '';
		let phone = '';
		let lastplay = [];
		if (value.name) {
			name = value.name;
		}
		if (value.pp) {
			pp = value.pp;
		}
		if (value.email) {
			email = value.email;
		}
		if (value.phone) {
			phone = value.phone;
		}
		if (value.lastplay) {
			lastplay = value.lastplay;
		}
		// console.log('Id array: ', idArray);

		// console.log(
		// 	'destructured: ',
		// 	type,
		// 	adddate,
		// 	name,
		// 	lastplayDate,
		// 	ppValues,
		// 	email
		// );

		const identifiers = ['na', 'em', 'ph', 'ids'];
		const mapping = {
			name: 'na',
			email: 'em',
			phone: 'ph',
			id: 'ids'
		};

		let idString = '';
		let idStringArray = [];
		let idArray = [];

		if (value.id) {
			value.id.forEach(id => {
				idArray.push(id['$']);
			});

			idArray.forEach(idElement => {
				const elString = `${idElement.type}:${idElement.code}`;
				idStringArray.push(elString);
			});
			idString = idStringArray.join(',');
			console.log('idString: ', idString);
		}

		const editString = `E na &${existingName}&${name}\nE ph &${existingName}&${
			phone ? phone : ''
		}\nE em &${existingName}&${email ? email : ''}\nE ids &${existingName}&${
			idString ? idString : ''
		}`;

		console.log('final request string: ', editString, '\n ------------');
		const newRevision = +dbRevision + 1;
		console.log('newRevision', newRevision);

		const xmlObject = {
			pdwrequest: {
				'@svs': `-v-10126j-v-${gameCode}`,
				'@pass': `${dirKey}`,
				'@remrev': `${newRevision.toString()}`
			}
		};
		xmlObject.pdwrequest.pdwscript = {
			'@itemtype': `${type}`,
			'@adddate': `${adddate}`,
			$: editString
		};
		const xml = create(xmlObject);
		const final = xml.end({ prettyPrint: true });

		console.log('final object: ', final, '\n-----------');

		return final;
	} catch (error) {
		throw error;
	}
}

module.exports = {
	parseSfAttribute,
	getMovementsData,
	convertXMLtoJSON,
	convertJSONtoXML,
	createCurrentGameXML,
	writePlayerDb,
	convertResponse,
	updateDatabase
};

//
// {
//   "key": "001",
//   "value": {
//     "$": {
//       "type": "player",
//       "n": "1",
//       "adddate": "11/01/13"
//     },
//     "name": [
//       "A Dalek"
//     ],
//     "lastplay": [
//       {
//         "$": {
//           "date": "10/05/23"
//         }
//       }
//     ],
//     "pp": [
//       {
//         "$": {
//           "n": "15,15,15,15,1,1,1,1,40"
//         }
//       }
//     ],
//     "id": [
//       {
//         "$": {
//           "type": "EBU",
//           "code": "EBU:012121212"
//         }
//       }
//     ]
//   },
//   "gameCode": "pairdum",
//   "dirKey": "puma"
// }
