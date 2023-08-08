import * as cheerio from 'cheerio';
import https, { RequestOptions } from 'https';
import fetch from 'node-fetch';
import { URL } from 'url';

export async function httpsFetch(options: string | RequestOptions | URL): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const req = https.request(options, function (res) {
      const chunks: Uint8Array[] = [];

      res.on('data', function (chunk: Uint8Array) {
        chunks.push(chunk);
      });

      res.on('end', function () {
        // (chunk) {
        return resolve(Buffer.concat(chunks));
      });

      res.on('error', function () {
        // (error) {
        return reject(false);
      });
    });

    req.end();
  });
}

export async function scrapeLyrics(url: string): Promise<string> {
  const response = await fetch(url);

  if (!response) {
    return 'no lyrics found';
  }

  const text = await response.text();

  if (!text) {
    return 'text not found';
  }

  const $ = cheerio.load(text);
  return $('.lyrics').text().trim();
}
