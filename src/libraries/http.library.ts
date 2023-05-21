import * as cheerio from 'cheerio';
import https, { RequestOptions } from 'https';
import fetch from 'node-fetch';
import { URL } from 'url';

export async function httpsFetch(
  options: string | RequestOptions | URL
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const req = https.request(options, function (res) {
      const chunks: Uint8Array[] = [];

      res.on('data', function (chunk: Uint8Array) {
        chunks.push(chunk);
      });

      res.on('end', function () { // (chunk) {
        return resolve(Buffer.concat(chunks));
      });

      res.on('error', function () { // (error) {
        return reject(false);
      });
    });

    req.end();
  });
}

export async function scrapeLyrics(
  url: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    fetch(url)
      .then((response) => {
        response
          .text()
          .then((text) => {
            const $ = cheerio.load(text);
            return resolve($('.lyrics').text().trim());
          })
          .catch((e) => {
            return reject(e);
          });
      })
      .catch((e) => {
        return reject(e);
      });
  });
}