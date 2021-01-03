import https, { RequestOptions } from 'https';
import { URL } from 'url';

export async function https_fetch(options: string | RequestOptions | URL): Promise<Buffer> {
	return new Promise((resolve, reject) => {
		const req = https.request(options, function (res) {
			const chunks: Uint8Array[] = [];

			res.on('data', function (chunk: any) { chunks.push(chunk); });
			res.on('end', function (chunk: any) { return resolve(Buffer.concat(chunks)); });
			res.on('error', function (error) { return reject(false); });
		});

		req.end();
	});
}
