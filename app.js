const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
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
const headersMiddleware = require('./src/middleware/headerLogging');
const app = express();

// //Init DotENV
dotenv.config({
	path: path.resolve(__dirname, './.env')
});

// console.log(process.env);

console.log('Node ENV: ', process.env.NODE_ENV);

// CORS and PORT retrieval
const allowedOrigin = process.env.ORIGIN;
const localHost = 'http://localhost:4200';
const companionOrigin = process.env.COMPANION_ORIGIN;
const devCompanionOrigin = process.env.DEV_COMPANION_ORIGIN;
const regOrigin = process.env.REGISTRATION_ORIGIN;
const wwwHtppsCompanion = process.env.COMPANION_HTTPS_WWW;
const wwwCompanion = process.env.COMPANION_WWW;
const originArray = [
	process.env.ORIGIN,
	localHost,
	companionOrigin,
	devCompanionOrigin,
	'http://192.168.68.100:4200',
	regOrigin,
	wwwCompanion,
	wwwHtppsCompanion
];

console.log(`allowedOrigin/s are: ${originArray}`);

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
	exposedHeaders: ['X-Filename', 'Filename']
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
const adminVerifyRoute = require('./src/routes/verify_admin');
//Initalise App

function decodeBSON(req, res, next) {
	let rawData = '';
	req.setEncoding('binary');
	req.on('data', chunk => {
		rawData += chunk;
	});
	req.on('end', () => {
		const decodedData = BSON.deserialize(Buffer.from(rawData, 'binary'));
		fs.appendFile('./data/data.json', JSON.stringify(decodedData));
		req.decodedData = decodedData;
		next();
	});
}

function captureHeaders(req, res, next) {
	const headers = req.headers;
	console.log(headers);
	next();
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
// app.post('*', decodeBSON);

// app.use(captureHeaders);

let certPath = '';
let caPath = '';
let keyPath = '';

const nodeEnv = process.env.NODE_ENV;

if (nodeEnv === 'prod') {
	// certPath = path.resolve(path.join(__dirname, '..', '..', 'certs'));
	// certKey = path.resolve(path.join(certPath, 'mongodb.pem'));
	// rootCA = path.resolve(path.join(certPath, 'ca.pem'));
	keyPath = process.env.DEV_KEY || '';
	caPath = process.env.DEV_CA || '';
} else {
	// certPath = path.resolve(
	// 	path.join(__dirname, '..', '..', '.ssh', 'server-certs', '')
	// );
	// certKey = path.resolve(path.join(certPath, 'mongodb.pem'));
	// rootCA = path.resolve(path.join(certPath, 'ca.pem'));
	keyPath = process.env.DEV_KEY || '';
	caPath = process.env.DEV_CA || '';
}

let certKey;
let caFile;

fs.readFile(keyPath).then(buffer => (certKey = buffer));
fs.readFile(caPath).then(buffer => (caFile = buffer));

const cloudDb = process.env.HOSTINGER_CLOUD_DB || '';

const mongoOptions = {
	tls: true,
	tlsCAFile: caFile,
	tlsCertificateKeyFile: certKey
};

mongoose
	.connect(
		cloudDb,
		mongoOptions
		// 	{
		// 	// useNewUrlParser: true,
		// 	// useUnifiedTopology: true,
		// 	tls: true,
		// 	tlsCAFile: fs.readFileSync(rootCA),
		// 	tlsCertificateKeyFile: certKey
		// }
	)
	.then(() => {
		console.log('Connected to Database at: ', process.env.HOSTINGER_DB);
	})
	.catch(err => {
		console.log('Connection Failed' + err);
		console.error(err);
	});

//Initalise Morgan and BodyParser
app.use(morgan('dev'));

// Debugging middleware
app.use(headersMiddleware.includeUrl);
// app.use(headersMiddleware.logHeaders);

app.use(cookieParser());
app.use(bodyParser.json({ limit: '1000mb' }));
app.use(bodyParser.urlencoded({ limit: '1000mb', extended: true }));

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
app.use('/ibescore/verification', adminVerifyRoute);

app.post('/ibescore/axios-test', async (req, res, next) => {
	try {
		const body = req.body;
		if (body) {
			res.status(200).json({ status: 'SUCCESS', data: req });
		} else {
			throw new Error('No Body in Request');
		}
	} catch (error) {
		res.status(500).json({ status: 'ERROR', error });
	}
});

app.use('/', (req, res) => {
	res.status(200).json({ message: 'Reached ANY route' });
});

//Assign Angular Route

// app.use('/', express.static(path.join(__dirname, 'dist')));
// app.get('*', function (req, res) {
// 	res.redirect('/#redirectto=main');
// });

app.use(errorHandling);
module.exports = app;
