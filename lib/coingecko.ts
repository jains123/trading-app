/**
 * CoinGecko API — free crypto market data, no API key required.
 * Rate limit: 30 requests/minute on free tier.
 */
import https from 'node:https';

const BASE = 'api.coingecko.com';

function httpsGet(path: string): Promise<{ status: number; body: string }> {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: BASE,
        path,
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0',
          Accept: 'application/json',
        },
      },
      (res) => {
        let body = '';
        res.on('data', (c: Buffer) => (body += c.toString()));
        res.on('end', () => resolve({ status: res.statusCode ?? 0, body }));
      },
    );
    req.on('error', reject);
    req.setTimeout(10_000, () => req.destroy(new Error('CoinGecko request timed out')));
    req.end();
  });
}

export interface CoinPriceResult {
  currentPrice: number;
  priceChange: number;
  priceChangePct: number;
  closes: number[];
  highs: number[];
  lows: number[];
}

export async function fetchCoinGecko(geckoId: string): Promise<CoinPriceResult> {
  // Single call: 90-day market chart includes current price as last data point
  // This halves our request count vs. separate price + chart calls
  const chartRes = await httpsGet(
    `/api/v3/coins/${geckoId}/market_chart?vs_currency=usd&days=90&interval=daily`,
  );

  if (chartRes.status !== 200) throw new Error(`CoinGecko chart HTTP ${chartRes.status}`);

  const chartData = JSON.parse(chartRes.body);

  // prices is [[timestamp_ms, price], ...] sorted ascending
  const closes: number[] = (chartData.prices ?? [])
    .map(([, price]: [number, number]) => price)
    .filter((p: number) => !isNaN(p));

  if (closes.length < 2) throw new Error(`CoinGecko: not enough data for ${geckoId}`);

  const currentPrice = closes[closes.length - 1];
  const prevClose = closes[closes.length - 2];
  const priceChange = currentPrice - prevClose;
  const priceChangePct = (priceChange / prevClose) * 100;

  // CoinGecko daily only provides closing prices.
  // Approximate highs/lows using adjacent closes to estimate intraday range.
  const highs: number[] = [];
  const lows: number[] = [];
  for (let i = 0; i < closes.length; i++) {
    const prev = i > 0 ? closes[i - 1] : closes[i];
    const curr = closes[i];
    const next = i < closes.length - 1 ? closes[i + 1] : closes[i];
    highs.push(Math.max(prev, curr, next));
    lows.push(Math.min(prev, curr, next));
  }

  return { currentPrice, priceChange, priceChangePct, closes, highs, lows };
}
