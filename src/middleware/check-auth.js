const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
const RSA_PUBLIC_KEY = fs.readFileSync(
	path.join(__dirname, '../../keys/public_key.pem')
);

const keyPass = process.env.KEY_PASS;

const decryptedKey = crypto.createPublicKey({
	key: RSA_PUBLIC_KEY,
	passphrase: keyPass
});

dotenv.config();
//is sync working? yes
module.exports = (req, res, next) => {

	try {
		if (process.env.ALLOW_LOCAL_STORAGE) {
			if (!req.headers.authorization) {
				token = req.cookies.SESSIONID;
			} else {
				console.log('Allowed Local Storage Token');
				token = req.headers.authorization.split(' ')[1];
			}
		} else {
			token = req.cookies.SESSIONID;
		}

		const decodedToken = jwt.verify(token, decryptedKey);
		req.userData = {
			slot: decodedToken.sub
		};

		next();
	} catch (error) {
		console.log('notauth');
		res.status(401).json({
			message: 'AUTHFAIL'
		});
	}
};
