const xml2js = require('xml2js');
const { create, convert } = require('xmlbuilder2');
const dateService = require('../date-service');

async function writeDatabaseXml(jsonData) {
	try {
		const doc = create(jsonData);
		const xml = doc.end({ prettyPrint: true });
		return xml;
	} catch (error) {
		throw error;
	}
}

async function writeEmpty() {
	try {
		const root = create({ version: '1.0' }).ele('root', { rev: '1' }).txt('');
		const xmlString = root.end({ prettyPrint: true });
		xmlString.trim();
		console.log(`xml string: "${xmlString}"`);

		return xmlString;
	} catch (error) {
		throw error;
	}
}

async function writeDbFromCsv(importData) {
	try {
		console.log('Data in writeDbFromCsv: ', importData);

		const headers = importData[0];

		const headerMap = {};

		headers.forEach((entry, index) => {
			const formattedHeader = entry.toLowerCase().replace(/[^a-zA-Z0-9]+/g, '_');
			headerMap[formattedHeader] = index;
		});

		console.log('headerMap: ', headerMap);

		const dataRows = importData.slice(1);

		// const
		const formatDate = dateService.todaysDate();
		const root = create({ version: '1.0' }).ele('root', { rev: '1' });

		dataRows.forEach((row, index) => {
			const item = root.ele('item', {
				type: 'player',
				n: (index + 1).toString(),
				adddate: formatDate
			});
			headers.forEach(header => {
				const formattedHeader = header.toLowerCase().replace(/[^a-zA-Z0-9]+/g, '_');

				const columnIndex = headerMap[formattedHeader];

				const value = columnIndex !== undefined ? row[columnIndex] : '';
				console.log('Row data: ', row);
				console.log('EBU value: ', row[headerMap['ebu']]);
				console.log('BBO value: ', row[headerMap['bbo']]);

				if (value) {
					const idArray = [];
					if (formattedHeader === 'ebu' || formattedHeader === 'bbo') {
						item.ele('id', { type: formattedHeader.toUpperCase(), code: value });
					} else {
						item.ele(formattedHeader).dat(value);
					}
					// if (headers.includes('ebu') || headers.includes('bbo')) {
					// 	if (headers.includes('ebu') && row[headerMap['ebu']]) {
					// 		idArray.push({
					// 			type: 'EBU',
					// 			code: row[headerMap['ebu']]
					// 		});
					// 	}
					// 	if (headers.includes('bbo') && row[headerMap['bbo']]) {
					// 		idArray.push({
					// 			type: 'BBO',
					// 			code: row[headerMap['bbo']]
					// 		});
					// 	}
					// 	if (idArray.length > 0) {
					// 		idArray.forEach(idElement => {
					// 			item.ele('id', idElement);
					// 		});
					// 	}
					// } else {
					// 	item.ele(formattedHeader).dat(value);
					// }
				}
			});

			// item.ele('name').dat(row[0]);
			// item.ele('email').dat(row[1]);
			// item.ele('phone').dat(row[2]);
		});

		const xmlString = root.end({ prettyPrint: true }).trim();
		// xmlString = xmlString.trim();
		console.log('DATA WRITTEN. returning XML string: ', xmlString);
		// return;
		return xmlString;
	} catch (error) {
		throw error;
	}
}

module.exports = { writeDatabaseXml, writeDbFromCsv, writeEmpty };
