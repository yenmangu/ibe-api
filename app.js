//Import Packages
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const { exec } = require('child_process');
const { BSON } = require('bson');
const path = require('path');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const app = express();
// //Init DotENV
dotenv.config({
	path: path.resolve(__dirname, './.env')
});

// CORS and PORT retrieval
const allowedOrigin = process.env.ORIGIN;
const localHost = 'http://localhost:4200';

const originArray = [process.env.ORIGIN, localHost];

console.log(`allowedOrigin/s are: ${allowedOrigin} & ${localHost}`);

// app.use((req, res, next) => {
// 	const actualOrigin = req.headers.origin;
// 	if (originArray.includes(actualOrigin)) {
// 		res.setHeader('Access-Control-Allow-Origin', actualOrigin);
// 	} else {
// 		return res.status(403).send('Unauthorized Origin');
// 	}
// 	res.setHeader(
// 		'Access-Control-Allow-Methods',
// 		'GET,POST,PATCH,DELETE,OPTIONS,PUT'
// 	);
// 	res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
// 	if (req.method === 'OPTIONS') {
// 		res.sendStatus(200);
// 	} else {
// 		next();
// 	}
// });

// app.use((req, res, next) => {
// 	res.setHeader('Access-Control-Allow-Origin', '*');

// 	res.setHeader(
// 		'Access-Control-Allow-Methods',
// 		'GET,POST,PATCH,DELETE,OPTIONS,PUT'
// 	);
// 	res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
// 	if (req.method === 'OPTIONS') {
// 		res.sendStatus(200);
// 	} else {
// 		next();
// 	}
// });

const corsOptions = {
	optionsSuccessStatus: 200,
	origin: function (origin, callback) {
		if (originArray.includes(origin) || !origin) {
			callback(null, true);
		} else {
			callback(new Error('unauthorized Origin'));
		}
	}
};

app.use(cors(corsOptions));

//Import Routes
// const authRoute = require('./src/routes/auth');
const authRoute = require('./src/routes/auth');
const eventRoute = require('./src/routes/event');
const p2pRoute = require('./src/routes/p2p');
const createTestUsers = require('./src/routes/testUsers');
const dealFiles = require('./src/routes/dealFiles');
const mailRoute = require('./src/routes/mailRoute');
const newRegistrationRoute = require('./src/routes/newRegistration');
//Initalise App

function decodeBSON(req, res, next) {
	let rawData = '';
	req.setEncoding('binary');
	req.on('data', chunk => {
		rawData += chunk;
	});
	req.on('end', () => {
		const decodedData = BSON.deserialize(Buffer.from(rawData, 'binary'));
		fs.appendFileSync('./data/data.json', JSON.stringify(decodedData));
		req.decodedData = decodedData;
		next();
	});
}

function logError(err, req, res, next) {
	if (err && err.code === 'ECONNREFUSED') {
		console.error(
			err.message,
			"Check your network. If using 'localhost' check Traefik is running."
		);
	}
	next(err);
}

app.use(logError);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.post(decodeBSON);

mongoose
	.connect(process.env.CLOUD_DB, {
		useNewUrlParser: true,
		useUnifiedTopology: true
	})
	.then(() => {
		console.log('Connected to Database');
	})
	.catch(err => {
		console.log('Connection Failed' + err);
		console.error(err);
	});

//Initalise Morgan and BodyParser
app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//app.use(express.static(path.join(__dirname,"../dist/brian_app")));
//Assign Routes
app.get('/ibescore/api-check', (req, res) => {
	res.status(200).json({ message: 'API working' });
});
app.use('/ibescore/auth', authRoute);
app.use('/ibescore/event', eventRoute);
app.use('/ibescore/test', createTestUsers);
app.use('/ibescore/p2p', p2pRoute);
app.use('/ibescore/deal_files', dealFiles);
app.use('/ibescore/mail', mailRoute);
app.use('/ibescore/register', newRegistrationRoute);

//Assign Angular Route

// app.use('/', express.static(path.join(__dirname, 'dist')));
app.get('*', function (req, res) {
	res.redirect('/#redirectto=main');
});

module.exports = app;
