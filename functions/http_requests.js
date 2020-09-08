/* eslint-disable no-cond-assign */
/* eslint-disable no-unused-vars */
const https = require('https');

module.exports = async (options) => {
	return new Promise((resolve, reject) => {
		const req = https.request(options, function(res) {
			const chunks = [];

			res.on('data', function(chunk) { chunks.push(chunk); });
			res.on('end', function(chunk) { return resolve(Buffer.concat(chunks)); });
			res.on('error', function(error) { return reject(false); });
		});

		req.end();
	});
};
