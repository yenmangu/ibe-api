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
	'withHash.csv'
);

const inputString = ''

const saltChars =
	'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789$%^&*()-_+=~';

const salt = bcrypt.genSaltSync(10, { charset: saltChars });

function generateHash(inputString, salt) {
	return bcrypt.hashSync(inputString, salt);
}

const output = generateHash(inputString, salt)
console.log(output)