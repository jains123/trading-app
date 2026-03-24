import { NextRequest, NextResponse } from 'next/server';
import { ASSETS } from '@/lib/assets';
import { calculateRSI, getSignal } from '@/lib/rsi';
import { fetchStooqStock } from '@/lib/stooq';
import { fetchCoinGecko } from '@/lib/coingecko';
import type { AssetData, ApiAssetsResponse } from '@/lib/types';

const SPARKLINE_POINTS = 24;
const DELAY_MS = 500;         // Stooq/CoinGecko are much more permissive than Yahoo Finance
const CACHE_TTL = 15 * 60_000; // 15 minute server-side cache

export const dynamic = 'force-dynamic';

let _cache: { data: ApiAssetsResponse; expiresAt: number } | null = null;

function delay(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

async function fetchAssetData(
  symbol: string,
  name: string,
  type: 'stock' | 'crypto',
  stooqSymbol: string | undefined,
  geckoId: string | undefined,
  buyThreshold: number,
  sellThreshold: number,
): Promise<AssetData> {
  try {
    let closes: number[];
    let currentPrice: number;
    let priceChange: number;
    let priceChangePct: number;

    if (type === 'stock' && stooqSymbol) {
      const data = await fetchStooqStock(stooqSymbol);
      closes = data.closes;
      currentPrice = data.currentPrice;
      priceChange = data.priceChange;
      priceChangePct = data.priceChangePct;
    } else if (type === 'crypto' && geckoId) {
      const data = await fetchCoinGecko(geckoId);
      closes = data.closes;
      currentPrice = data.currentPrice;
      priceChange = data.priceChange;
      priceChangePct = data.priceChangePct;
    } else {
      throw new Error(`No data source configured for ${symbol}`);
    }

    const rsi = calculateRSI(closes);
    const signal = getSignal(rsi, buyThreshold, sellThreshold);
    const sparkline = closes.slice(-SPARKLINE_POINTS);


    return {
      symbol,
      name,
      type,
      price: currentPrice,
      priceChange,
      priceChangePct,
      rsi,
      signal,
      sparkline,
      lastUpdated: new Date().toISOString(),
    };
  } catch (err) {
    console.error(`[assets] ${symbol} error:`, err instanceof Error ? err.message : err);
    return {
      symbol,
      name,
      type,
      price: 0,
      priceChange: 0,
      priceChangePct: 0,
      rsi: null,
      signal: 'ERROR',
      sparkline: [],
      lastUpdated: new Date().toISOString(),
      error: true,
    };
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const buyThreshold = parseFloat(searchParams.get('buyThreshold') ?? '30');
  const sellThreshold = parseFloat(searchParams.get('sellThreshold') ?? '70');

  // Serve cache if fresh
  if (_cache && Date.now() < _cache.expiresAt) {
    return NextResponse.json(_cache.data, {
      headers: { 'Cache-Control': 'no-store', 'X-Cache': 'HIT' },
    });
  }


  const assets: AssetData[] = [];
  for (let i = 0; i < ASSETS.length; i++) {
    const asset = ASSETS[i];
    const data = await fetchAssetData(
      asset.symbol,
      asset.name,
      asset.type,
      asset.stooqSymbol,
      asset.geckoId,
      buyThreshold,
      sellThreshold,
    );
    assets.push(data);
    if (i < ASSETS.length - 1) await delay(DELAY_MS);
  }

  const response: ApiAssetsResponse = {
    assets,
    fetchedAt: new Date().toISOString(),
  };

  if (assets.some((a) => !a.error)) {
    _cache = { data: response, expiresAt: Date.now() + CACHE_TTL };
  }

  return NextResponse.json(response, { headers: { 'Cache-Control': 'no-store' } });
}
