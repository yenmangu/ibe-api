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
const timeLogger = require('./src/middleware/timeLogger');
const errorHandling = require('./src/middleware/error_handling');
const app = express();
// //Init DotENV
dotenv.config({
	path: path.resolve(__dirname, './.env')
});

// CORS and PORT retrieval
const allowedOrigin = process.env.ORIGIN;
const localHost = 'http://localhost:4200';
const companionOrigin = process.env.COMPANION_ORIGIN;
const devCompanionOrigin = process.env.DEV_COMPANION_ORIGIN;

const originArray = [
	process.env.ORIGIN,
	localHost,
	companionOrigin,
	devCompanionOrigin
];

console.log(`allowedOrigin/s are: ${originArray}`);

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
	// allowedHeaders: ['X-Filename'],
	origin: function (origin, callback) {
		if (originArray.includes(origin) || !origin) {
			callback(null, true);
		} else {
			callback(new Error('unauthorized Origin'));
		}
	},
	exposedHeaders: ['X-Filename']
};

app.use(cors(corsOptions));

//Import Routes
// const authRoute = require('./src/routes/auth');

const devRoute = require('./src/routes/dev/_dev');

const webhook = require('./src/routes/webhook');

const authRoute = require('./src/routes/auth');
const eventRoute = require('./src/routes/event');
const p2pRoute = require('./src/routes/p2p');
const createTestUsers = require('./src/routes/test_users');
const dealFiles = require('./src/routes/deal_files');
const mailRoute = require('./src/routes/mail_route');
const newRegistrationRoute = require('./src/routes/new_registration');
const receivedDataRoute = require('./src/routes/remote_data');
const curentGameRoute = require('./src/routes/current-game/current_game_routes');
const playerDbRoute = require('./src/routes/player-database/player_database');
const historicGamesRoute = require('./src/routes/historic-games/historic-games');
const publicLineupRoute = require('./src/routes/public_lineup');
const fileRoute = require('./src/routes/files/upload_file');
const gameActionsRoute = require('./src/routes/current-game/game_actions_routes');
const handActionsRoute = require('./src/routes/current-game/hand_actions_routes');
const spectateRoute = require('./src/routes/spectate');
const adminToolsRoute = require('./src/routes/admin_tools');
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

app.use(timeLogger);
app.use(logError);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '20mb' }));
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

app.use('/ibescore/dev', devRoute);

app.use('/ibescore/webhook', webhook);
app.use('/ibescore/auth', authRoute);
app.use('/ibescore/event', eventRoute);
app.use('/ibescore/test', createTestUsers);
app.use('/ibescore/p2p', p2pRoute);
app.use('/ibescore/deal_files', dealFiles);
app.use('/ibescore/mail', mailRoute);
app.use('/ibescore/register', newRegistrationRoute);
app.use('/ibescore/database', receivedDataRoute);
app.use('/ibescore/current_game', curentGameRoute);
app.use('/ibescore/player-database', playerDbRoute);
app.use('/ibescore/historic-games', historicGamesRoute);
app.use('/ibescore/lineup', publicLineupRoute);
app.use('/ibescore/files', fileRoute);
app.use('/ibescore/game-actions', gameActionsRoute);
app.use('/ibescore/hand-actions', handActionsRoute);
app.use('/ibescore/spectate', spectateRoute);
app.use('/ibescore/admin-tools', adminToolsRoute);

//Assign Angular Route

// app.use('/', express.static(path.join(__dirname, 'dist')));
// app.get('*', function (req, res) {
// 	res.redirect('/#redirectto=main');
// });

app.use(errorHandling);
module.exports = app;
