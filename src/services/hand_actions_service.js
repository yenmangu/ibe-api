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
	console.log('data in build EBU Elements');

	const dataString = `${data.clubName}\r\n${data.clubId}\r\n${data.eventName}\r\n${
		data.chargeCode ? data.chargeCode : '10'
	}\r\n${data.awardMp ? 'Y' : 'N'}\r\n${data.mpType}\r\n${data.mpScale}\r\n${
		data.directorName ? data.directorName : ''
	}\r\n${data.directorEmail ? data.directorEmail : ''}\r\n\r\n${
		data.perMatchWon ? 'y' : 'n'
	}\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n${
		data.comments ? data.comments : ''
	}`;

	// const dataString = `${data.clubName}\n${data.clubId}\n${data.eventName}\n${
	// 	data.chargeCode ? data.chargeCode : '10'
	// }\n${data.awardMp ? 'Y' : 'N'}\n${data.mpType}\n${data.mpScale}\n${
	// 	data.directorName ? data.directorName : ''
	// }\n${data.directorEmail ? data.directorEmail : ''}\n\n${
	// 	data.perMatchWon ? 'y' : 'n'
	// }\n\n\n\n\n\n\n\n\n\n\n${data.comments ? data.comments : ''}\n`;
	console.log('Data String payload: \n', dataString);
	// dataString.trim();
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
