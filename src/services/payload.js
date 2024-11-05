function writeBridgeWebsPayload(data, type) {
	const { eventName, gameCode, data: formData } = data;
	let string = '';

	if (type === 'upload') {
		return `
${gameCode}
${formData.bwAccountName}
${formData.bwPassword}
${formData.bwEventName ? formData.bwEventName : ''}
${formData.bwDirectorName}
${formData.bwScorerName}
${formData.bwMasterpoints === true ? 'Y' : 'N'}
${
	formData.bwMasterpoints === true
		? formData.masterpointsMatchWon === true
			? 'Y'
			: 'n'
		: 'n'
}`.trim();
	} else if (type === 'download') {
		return `
		${formData.bwEventName}
		${formData.bwAccountName}
		${formData.bwPassword}
		${eventName}
		${formData.bwDirectorName}
		${formData.bwScorerName}
		${formData.bwMasterpoints === true ? 'Y' : 'N'}
		${
			formData.bwMasterpoints === true
				? formData.masterpointsMatchWon === true
					? 'Y'
					: 'n'
				: 'n'
		}`.trim();
	} else {
		return '';
	}
}

module.exports = { writeBridgeWebsPayload };

// function writeBridgeWebsPayload(data, type) {
// 	const { gameCode, data: formData } = data;
// 	if (type === 'upload') {
// 		return `
// 		${gameCode}
// 		${formData.bwAccountName}
// 		${formData.bwPassword}
// 		${formData.bwEventName ? formData.bwEventName : ''}
// 		${formData.bwDirectorName}
// 		${formData.bwScorerName}
// 		${formData.bwMasterpoints === true ? 'Y' : 'N'}
// 		${
// 			formData.bwMasterpoints === true
// 				? formData.masterpointsMatchWon === true
// 					? 'Y'
// 					: 'n'
// 				: 'n'
// 		}`.trim();
// 	} else if (type === 'download') {
// 		return `

// 		`;
// 	} else {
// 		return '';
// 	}
// }
