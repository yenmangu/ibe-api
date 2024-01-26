exports.todaysDate = () => {
	const currentDate = new Date();
	const day = String(currentDate.getDate()).padStart(2, '0');
	const month = String(currentDate.getMonth() + 1).padStart(2, '0');
	const year = String(currentDate.getFullYear());

	const formatDate = `${day}/${month}/${year}`;
	return formatDate;
};
