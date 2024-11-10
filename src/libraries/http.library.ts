// http.library.ts
import * as cheerio from "npm:cheerio";
import logger from "../utilities/log.utility.ts";

interface RetryConfig {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  timeout: number;
}

const defaultRetryConfig: RetryConfig = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 5000,
  timeout: 5000,
};

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function httpsFetch(
  input: string | URL | Request,
  init?: RequestInit,
  retryConfig: RetryConfig = defaultRetryConfig,
): Promise<Response> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < retryConfig.maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        retryConfig.timeout,
      );

      const response = await fetch(input, {
        ...init,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      logger.info(`Response received on attempt ${attempt + 1}`);
      return response;
    } catch (error) {
      lastError = error as Error;
      if (error instanceof Error) {
        logger.error(`Attempt ${attempt + 1} failed: ${error.message}`);
      } else {
        logger.error(`Attempt ${attempt + 1} failed with an unknown error`);
      }

      if (attempt < retryConfig.maxRetries - 1) {
        const delayTime = Math.min(
          retryConfig.initialDelay * Math.pow(2, attempt),
          retryConfig.maxDelay,
        );
        await delay(delayTime);
      }
    }
  }

  throw new Error(
    `Failed after ${retryConfig.maxRetries} attempts. Last error: ${lastError?.message}`,
  );
}

export async function scrapeLyrics(url: string): Promise<string> {
  const response = await fetch(url);

  if (!response) {
    return "no lyrics found";
  }

  const text = await response.text();

  if (!text) {
    return "text not found";
  }

  const $ = cheerio.load(text);
  return $(".lyrics").text().trim();
}
