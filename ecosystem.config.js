module.exports = {
	apps: [
		{
			name: 'ibe-api',
			script: 'server.js',
			env: {
				NODE_ENV: 'prod'
			},
			watch: true,
			ignore_watch: ['temp']
		}
	]
};
