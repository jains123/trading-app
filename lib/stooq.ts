/**
 * Stooq.com — free stock OHLCV data, no API key required.
 * Returns daily historical data as CSV, designed for programmatic access.
 */
import https from 'node:https';

function httpsGet(url: string): Promise<{ status: number; body: string }> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const req = https.request(
      {
        hostname: parsed.hostname,
        path: parsed.pathname + parsed.search,
        method: 'GET',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        },
      },
      (res) => {
        let body = '';
        res.on('data', (c: Buffer) => (body += c.toString()));
        res.on('end', () => resolve({ status: res.statusCode ?? 0, body }));
      },
    );
    req.on('error', reject);
    req.setTimeout(10_000, () => req.destroy(new Error('Stooq request timed out')));
    req.end();
  });
}

function parseStooqCsv(csv: string): { closes: number[]; currentPrice: number; prevClose: number } {
  const lines = csv.trim().split('\n').filter(Boolean);
  if (lines.length < 2) throw new Error('Stooq: insufficient data');

  // Format: Date,Open,High,Low,Close,Volume (ascending date order)
  const rows = lines.slice(1).map((line) => {
    const cols = line.split(',');
    return parseFloat(cols[4]); // Close price
  }).filter((n) => !isNaN(n));

  if (rows.length < 2) throw new Error('Stooq: no valid rows');

  return {
    closes: rows,
    currentPrice: rows[rows.length - 1],
    prevClose: rows[rows.length - 2],
  };
}

export async function fetchStooqStock(stooqSymbol: string): Promise<{
  closes: number[];
  currentPrice: number;
  priceChange: number;
  priceChangePct: number;
}> {
  // Fetch last ~90 calendar days = ~63 trading days (well above RSI-14 requirement)
  const d2 = new Date();
  const d1 = new Date(d2.getTime() - 90 * 24 * 60 * 60 * 1000);
  const fmt = (d: Date) =>
    `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;

  const url = `https://stooq.com/q/d/l/?s=${encodeURIComponent(stooqSymbol)}&i=d&d1=${fmt(d1)}&d2=${fmt(d2)}`;
  const { status, body } = await httpsGet(url);

  if (status !== 200) throw new Error(`Stooq HTTP ${status} for ${stooqSymbol}`);

  const { closes, currentPrice, prevClose } = parseStooqCsv(body);
  const priceChange = currentPrice - prevClose;
  const priceChangePct = (priceChange / prevClose) * 100;

  return { closes, currentPrice, priceChange, priceChangePct };
}
