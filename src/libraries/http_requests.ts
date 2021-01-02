const https = require('https');

async (options) => {
	return new Promise((resolve, reject) => {
		const req = https.request(options, function (res) {
			const chunks = [];

			res.on('data', function (chunk) { chunks.push(chunk); });
			res.on('end', function (chunk) { return resolve(Buffer.concat(chunks)); });
			res.on('error', function (error) { return reject(false); });
		});

		req.end();
	});
}
