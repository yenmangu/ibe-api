const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const inputFilePath = path.join(
	__dirname,
	'..',
	'..',
	'csv',
	'input',
	'noHash.csv'
);
const outputFilePath = path.join(
	__dirname,
	'..',
	'..',
	'csv',
	'output',
	'withHash-new.csv'
);

const saltChars =
	'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789$%^&*()-_+=~';

const salt = bcrypt.genSaltSync(10, { charset: saltChars });

function generateHash(inputString) {
	return bcrypt.hashSync(inputString, salt);
}

const hashValues = [];

fs.createReadStream(inputFilePath)
	.pipe(csv())
	.on('data', (row) => {
		// read csv
		const currentPass = row['password'];
		const hashValue = generateHash(currentPass);
		hashValues.push(hashValue);
	})
	.on('end', () => {
		// read csv and add hash values
		let outputData = '';
		let index = 0;
		fs.createReadStream(inputFilePath)
			.pipe(csv())
			.on('data', (row) => {
				row['hash'] = hashValues[index];
				index++;
				outputData += Object.values(row).join(',') + '\n';
			})
			.on('end', () => {
				fs.writeFile(outputFilePath, outputData, err => {
					if (err) {
						console.log('error writing to csv: ', err);
					} else {
						console.log('hash values successfully added to the new csv file');
					}
				});
			});
	});
