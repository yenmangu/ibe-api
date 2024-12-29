const dotenv = require('dotenv');
dotenv.config();
const app = require('./app');
const debug = require('debug')('node-angular');
const http = require('http');
const path = require('path');

process.on('unhandledRejection', (reason, promise) => {
	console.error('Unhandled rejection at: ', promise, 'reason: ', reason);
});

process.on('uncaughtException', error => {
	console.error('Uncaught Exception:', error);
});

const normalizePort = val => {
	var port = parseInt(val, 10);

	if (isNaN(port)) {
		// named pipe
		return val;
	}

	if (port >= 0) {
		// port number
		return port;
	}

	return false;
};

const onError = error => {
	if (error.syscall !== 'listen') {
		throw error;
	}
	const bind = typeof port === 'string' ? 'pipe ' + port : 'port ' + port;
	switch (error.code) {
		case 'EACCES':
			console.error(bind + ' requires elevated privileges');
			process.exit(1);
			break;
		case 'EADDRINUSE':
			console.error(bind + ' is already in use');
			process.exit(1);
			break;
		default:
			throw error;
	}
};

const onListening = () => {
	const addr = server.address();
	const bind = typeof port === 'string' ? 'pipe ' + port : 'port ' + port;
	debug('Listening on ' + bind);
};

const port = normalizePort(process.env.PORT || '3030');
if (process.env.NODE_ENV === 'dev') {
	console.log('NODE_ENV=DEV');
	// console.log('PORT ' + port);
	if (process.env.ALLOW_LOCAL_STORAGE) {
		console.log('ALLOWING LOCAL STORAGE AUTH');
		console.log('PORT ' + port);
	}
} else {
	console.log('PORT ' + port);
}
app.set('port', port);

const server = http.createServer(app);
server.on('error', onError);
server.on('listening', onListening);

server.listen(port);
