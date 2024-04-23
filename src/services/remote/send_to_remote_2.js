const axios = require('axios');

function getFormDataHeaders(formData) {
	return { 'Content-Type': `multipart/form-data; boundary=${formData._boundary}` };
}
