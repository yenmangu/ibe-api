function convertURL(inputString) {
	if (!inputString.startsWith('htt')) {
		console.log('Non Link, skipping');
		return;
	}

	if (inputString.includes('?bbo=')) {
		console.log('skipping BBO');
		return;
	}

	const step1Result = inputString.replace(/^.*\?lin=/, 'qx|o*|');

	const matchResult = inputString.match(/\|Board(%20)?(\d+)\|/);
	let boardNumber;
	if (matchResult !== null) {
		// console.log(matchResult);
		boardNumber = matchResult[2];
	}

	// Step 3: Replace "*" with the extracted board number
	// console.log(boardNumber);
	const step3Result = step1Result.replace(/\*/, boardNumber);

	// Step 4: Replace usernames
	const usernameMatch = inputString.match(/\|pn\|([^|]+)/);
	let usernames;

	if (usernameMatch && usernameMatch[1]) {
		usernames = usernameMatch[1].split(',');
	} else {
		usernames = [];
	}

	const replacement = '|pn|south,west,north,east|';

	const finalResult = step3Result.replace(/\|pn\|[^|]*\|/g, replacement);

	// for (let i = 0; i < usernames.length; i++) {
	// 	replacement = replacement.replace(usernames[i], usernames[i]);
	// }

	// Combine the results
	// const finalResult = step3Result.replace(/\|pn\|[^|]+\|/, replacement + '|');

	// console.log(finalResult);

	return finalResult;
}

module.exports = { convertURL };
