const formData = require('form-data');

async function buildPayload(options) {
	const formData = new FormData();
	formData.append('postdatapassedbyform', options.inputTitle);
	console.log('formData in build payload: ', formData);

	return formData;
}

async function buildQueryString(options) {
	console.log('build query string invoked with options: ', options);

	let string;
	if (options.TYPE === 'movement') {
		string = `SLOT=${options.gameCode}&TYPE=MCPDF&NOWRAP=TRUE&P1=x&P2=x&P3=x&P4=x&P5=x&DL=t`;
	}
	if (options.TYPE === 'HTMLNEW') {
		console.log(`${options.TYPE} Detected`);

		const format =
			options.fileType === 'html'
				? 'HTML'
				: options.fileType === 'pdf'
				? 'PDF'
				: 'html';
		console.log('FORMAT: ', format);
		return `SLOT=${options.gameCode}&TYPE=${options.TYPE}&P1=${format}&P2=${options.rankings}&P3=${options.fullResults}&P4=${options.handDiagrams}&P5=${options.personalScore}`;
	}

	if ((options.TYPE = 'EBUP2PXML')) {
		string = `SLOT=${options.gameCode}&TYPE=${options.type}&NOWRAP=TRUE`;
	}
	console.log('string in buildString method: ', string);

	return string;
}

module.exports = { buildPayload, buildQueryString };
