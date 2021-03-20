import https, { RequestOptions } from 'https';
import { URL } from 'url';
import cheerio from 'cheerio';
const fetch = require('node-fetch');

export async function https_fetch(
	options: string | RequestOptions | URL
): Promise<Buffer> {
	return new Promise((resolve, reject) => {
		const req = https.request(options, function (res) {
			const chunks: Uint8Array[] = [];

			res.on('data', function (chunk: any) {
				chunks.push(chunk);
			});
			res.on('end', function (chunk: any) {
				return resolve(Buffer.concat(chunks));
			});
			res.on('error', function (error) {
				return reject(false);
			});
		});

		req.end();
	});
}

export async function scrape_lyrics(
	url: string
): Promise<string> {
	return new Promise((resolve, reject) => {
		fetch(url)
			.then((response: any) => {
				response.text()
					.then((text: any) => {
						const $ = cheerio.load(text);
						return resolve($('.lyrics').text().trim());
					})
					.catch((e: any) => {
						return reject(e);
					});
			})
			.catch((e: any) => {
				return reject(e);
			});
	});
};