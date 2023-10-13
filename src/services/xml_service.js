const xml2js = require('xml2js');
const xmlescape = require('xml-escape');
const builder = require('xmlbuilder');
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

module.exports = {
	parseSfAttribute,
	getMovementsData,
	convertXMLtoJSON,
	convertJSONtoXML
};
