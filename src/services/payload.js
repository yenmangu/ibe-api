function writeBridgeWebsPayload(data) {
	return `
${data.gameCode}
${data.bwAccountName}
${data.bwPassword}
${data.bwEventName ? data.bwEventName : ''}
${data.bwDirectorName}
${data.bwScorerName}
${data.bwMasterpoints === true ? 'Y' : 'N'}
${
	data.bwMasterpoints === true
		? data.masterpointsMatchWon === true
			? 'Y'
			: 'n'
		: 'n'
}`.trim();
}

module.exports = { writeBridgeWebsPayload };
