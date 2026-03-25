import { NextRequest, NextResponse } from 'next/server';
import { STOCK_LIST } from '@/lib/stockList';
import https from 'node:https';

export const dynamic = 'force-dynamic';

interface SearchResult {
  symbol: string;
  name: string;
  type: 'stock' | 'crypto';
  stooqSymbol?: string;
  geckoId?: string;
}

function httpsGet(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const req = https.request(
      { hostname: parsed.hostname, path: parsed.pathname + parsed.search, method: 'GET', headers: { Accept: 'application/json' } },
      (res) => {
        let body = '';
        res.on('data', (c: Buffer) => (body += c.toString()));
        res.on('end', () => resolve(body));
      },
    );
    req.on('error', reject);
    req.setTimeout(5000, () => req.destroy(new Error('timeout')));
    req.end();
  });
}

async function searchCrypto(query: string): Promise<SearchResult[]> {
  try {
    const body = await httpsGet(
      `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(query)}`,
    );
    const data = JSON.parse(body);
    const coins = (data.coins ?? []).slice(0, 15);
    return coins.map((c: { id: string; symbol: string; name: string }) => ({
      symbol: `${c.symbol.toUpperCase()}-USD`,
      name: c.name,
      type: 'crypto' as const,
      geckoId: c.id,
    }));
  } catch {
    return [];
  }
}

function searchStocks(query: string): SearchResult[] {
  const q = query.toLowerCase();
  return STOCK_LIST.filter(
    (s) => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q),
  )
    .slice(0, 15)
    .map((s) => ({
      symbol: s.symbol,
      name: s.name,
      type: 'stock' as const,
      stooqSymbol: s.stooqSymbol,
    }));
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim();
  if (!q || q.length < 1) {
    return NextResponse.json({ results: [] });
  }

  const type = request.nextUrl.searchParams.get('type') ?? 'all';

  let results: SearchResult[] = [];

  if (type === 'stock' || type === 'all') {
    results.push(...searchStocks(q));
  }
  if (type === 'crypto' || type === 'all') {
    const crypto = await searchCrypto(q);
    results.push(...crypto);
  }

  // Deduplicate by symbol
  const seen = new Set<string>();
  results = results.filter((r) => {
    if (seen.has(r.symbol)) return false;
    seen.add(r.symbol);
    return true;
  });

  return NextResponse.json({ results: results.slice(0, 20) });
}
