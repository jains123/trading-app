/**
 * Native Node.js HTTPS client — bypasses undici/fetch quirks that
 * can trigger Yahoo Finance rate limiting.
 */
import https from 'node:https';

const DEFAULT_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

export function nodeGet(
  url: string,
  headers: Record<string, string> = {},
): Promise<{ status: number; body: string }> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);

    const req = https.request(
      {
        hostname: parsed.hostname,
        path: parsed.pathname + parsed.search,
        method: 'GET',
        headers: { 'User-Agent': DEFAULT_UA, ...headers },
      },
      (res) => {
        let body = '';
        res.on('data', (chunk: Buffer) => {
          body += chunk.toString();
        });
        res.on('end', () => resolve({ status: res.statusCode ?? 0, body }));
      },
    );

    req.on('error', reject);
    req.setTimeout(15_000, () => {
      req.destroy(new Error('Request timed out'));
    });
    req.end();
  });
}
