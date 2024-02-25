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

async function buildEbuElement(data) {
	const dataString = `${data.clubName}\n${data.clubId}\n${data.eventName}\n${
		data.chargeCode ? data.chargeCode : '10'
	}\n${data.awardMp ? 'Y' : 'N'}\n${data.mpType}\n${data.mpScale}\n${
		data.directorName ? data.directorName : ''
	}\n${data.directorEmail ? data.directorEmail : ''}\n\n${
		data.perMatchWon ? 'y' : 'n'
	}\n\n\n\n\n\n\n\n\n\n${data.comments ? data.comments : ''}`;
	console.log('Data String payload: ', dataString);
	return dataString;
}

async function buildEbuPayload(dataString) {
	const formData = new FormData();

	formData.append('postdatapassedbyform', dataString);
	return formData;
}

module.exports = {
	buildPayload,
	buildQueryString,
	buildEbuElement,
	buildEbuPayload
};
