/**
 * Yahoo Finance v8 chart API.
 * A single request without auth works fine; multiple simultaneous requests
 * get rate-limited (429). We fetch sequentially with a small delay.
 */

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

export interface YahooChartMeta {
  regularMarketPrice: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  previousClose: number;
  currency: string;
}

export interface YahooChartResult {
  meta: YahooChartMeta;
  indicators: {
    quote: Array<{
      close: (number | null)[];
      open: (number | null)[];
      high: (number | null)[];
      low: (number | null)[];
      volume: (number | null)[];
    }>;
  };
}

export async function fetchYahooChart(
  symbol: string,
  interval = '1h',
  range = '7d',
): Promise<YahooChartResult> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=${interval}&range=${range}`;

  console.log(`[yf] GET ${url}`);
  const res = await fetch(url, {
    headers: { 'User-Agent': UA },
    cache: 'no-store',
  });
  console.log(`[yf] ${symbol} → ${res.status}`);

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Yahoo Finance HTTP ${res.status} for ${symbol}: ${body.slice(0, 100)}`);
  }

  const json = await res.json();

  if (json?.chart?.error) {
    throw new Error(`Yahoo Finance: ${JSON.stringify(json.chart.error)}`);
  }

  const result = json?.chart?.result?.[0];
  if (!result) {
    throw new Error(`Yahoo Finance: no data for ${symbol}`);
  }

  return result as YahooChartResult;
}
