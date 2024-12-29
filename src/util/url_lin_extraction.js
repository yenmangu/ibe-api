function makeOutput(string) {
	var step1Result = inputString.replace(/^.*\?lin=/, 'qx|o*|');

	// console.log('1: ', step1Result);

	const matchResult = inputString.match(/\|Board(%20)?(\d+)\|/);
	let boardNumber;
	if (matchResult !== null) {
		// console.log(matchResult);
		boardNumber = matchResult.length - 1;
	}
	// console.log(boardNumber);

	// Step 3: Replace "*" with the extracted board number
	var step3Result = step1Result.replace(/\*/, boardNumber);

	// console.log('3: ', step3Result);
	// Step 4: Replace usernames
	var usernames = inputString.match(/\|pn\|([^|]+)/)[1].split(',');
	var replacement = '|pn|south,west,north,east';

	for (var i = 0; i < usernames.length; i++) {
		replacement = replacement.replace(usernames[i], usernames[i]);
	}
	// console.log('4: ', replacement);

	// Combine the results
	var finalResult = step3Result.replace(/\|pn\|[^|]+\|/, replacement + '|');

	// console.log(finalResult);

	output.innerText = finalResult;
}

module.exports = makeOutput;
