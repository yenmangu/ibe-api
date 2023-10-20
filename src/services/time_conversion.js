function convertTime(timeString) {
	if (timeString === null) {
		return null;
	}
	const [time, modifier] = timeString.split(' ');
	const [hours, minutes] = time.split(':');

	const hoursInt = parseInt(hours, 10);
	const minutesInt = parseInt(minutes, 10);

	if (modifier === 'PM' && hoursInt !== 12) {
		hoursInt += 12;
	}

	const formattedHours = hoursInt.toString().padStart(2, '0');
	const formattedMinutes = minutesInt.toString().padStart(2, '0');
	return `${formattedHours}:${formattedMinutes}`;
}

module.exports = { convertTime };
