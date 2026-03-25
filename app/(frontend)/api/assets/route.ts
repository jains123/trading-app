import { NextRequest, NextResponse } from 'next/server';
import { headers as getHeaders } from 'next/headers';
import { getPayload } from 'payload';
import config from '@payload-config';
import { ASSETS } from '@/lib/assets';
import { fetchStooqStock } from '@/lib/stooq';
import { fetchCoinGecko } from '@/lib/coingecko';
import { calculateAllStrategies, combineSignals } from '@/lib/strategies';
import { calculateSLTP } from '@/lib/atr';
import { detectLevels } from '@/lib/levels';
import { runBacktest } from '@/lib/backtest';
import { TIMEFRAME_PRESETS, type TimeframeId, type TimeframePreset } from '@/lib/timeframes';
import type { AssetData, ApiAssetsResponse, StrategyDetail } from '@/lib/types';

const SPARKLINE_POINTS = 24;
const DELAY_MS = 500;
const CACHE_TTL = 15 * 60_000;

export const dynamic = 'force-dynamic';

// Per-asset cache keyed by "symbol:timeframe"
const _assetCache = new Map<string, { data: AssetData; expiresAt: number }>();

function delay(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

interface WatchlistAsset {
  symbol: string;
  name: string;
  type: 'stock' | 'crypto';
  stooqSymbol?: string;
  geckoId?: string;
}

async function fetchAssetData(
  asset: WatchlistAsset,
  enabledStrategies: string[],
  tf: TimeframePreset,
): Promise<AssetData> {
  const { symbol, name, type, stooqSymbol, geckoId } = asset;

  try {
    let closes: number[];
    let highs: number[];
    let lows: number[];
    let currentPrice: number;
    let priceChange: number;
    let priceChangePct: number;

    if (type === 'stock' && stooqSymbol) {
      const data = await fetchStooqStock(stooqSymbol);
      closes = data.closes;
      highs = data.highs;
      lows = data.lows;
      currentPrice = data.currentPrice;
      priceChange = data.priceChange;
      priceChangePct = data.priceChangePct;
    } else if (type === 'crypto' && geckoId) {
      const data = await fetchCoinGecko(geckoId);
      closes = data.closes;
      highs = data.highs;
      lows = data.lows;
      currentPrice = data.currentPrice;
      priceChange = data.priceChange;
      priceChangePct = data.priceChangePct;
    } else {
      throw new Error(`No data source configured for ${symbol}`);
    }

    const allSignals = calculateAllStrategies(closes, tf.rsiBuyThreshold, tf.rsiSellThreshold, tf);

    const strategySignals: Record<string, StrategyDetail> = {
      rsi: { signal: allSignals.rsi.signal, value: allSignals.rsi.value },
      macd: { signal: allSignals.macd.signal, data: allSignals.macd.data ? { ...allSignals.macd.data } : null },
      bb: { signal: allSignals.bb.signal, data: allSignals.bb.data ? { ...allSignals.bb.data } : null },
      ma_cross: { signal: allSignals.ma_cross.signal, data: allSignals.ma_cross.data ? { ...allSignals.ma_cross.data } : null },
    };

    const signal = combineSignals(allSignals, enabledStrategies);

    const sltp = (signal === 'BUY' || signal === 'SELL')
      ? calculateSLTP(highs, lows, closes, signal, tf.slMultiplier, tf.tpMultiplier)
      : null;

    const levels = detectLevels(closes);

    const backtestResult = runBacktest(closes, highs, lows, enabledStrategies, tf.rsiBuyThreshold, tf.rsiSellThreshold, tf);
    const backtest = backtestResult ? {
      totalReturn: backtestResult.totalReturn,
      winRate: backtestResult.winRate,
      tradeCount: backtestResult.tradeCount,
      avgWin: backtestResult.avgWin,
      avgLoss: backtestResult.avgLoss,
      maxDrawdown: backtestResult.maxDrawdown,
      profitFactor: backtestResult.profitFactor,
      avgRR: backtestResult.avgRR,
    } : null;

    const sparkline = closes.slice(-SPARKLINE_POINTS);

    return {
      symbol, name, type,
      price: currentPrice, priceChange, priceChangePct,
      rsi: allSignals.rsi.value,
      signal, strategySignals, sltp, levels, backtest, sparkline,
      lastUpdated: new Date().toISOString(),
    };
  } catch (err) {
    console.error(`[assets] ${symbol} error:`, err instanceof Error ? err.message : err);
    return {
      symbol, name, type,
      price: 0, priceChange: 0, priceChangePct: 0,
      rsi: null, signal: 'ERROR', strategySignals: {}, sltp: null, levels: [], backtest: null, sparkline: [],
      lastUpdated: new Date().toISOString(), error: true,
    };
  }
}

async function getUserWatchlist(): Promise<WatchlistAsset[] | null> {
  try {
    const payload = await getPayload({ config });
    const headersList = await getHeaders();
    const { user } = await payload.auth({ headers: headersList });
    if (!user) return null;
    const wl = (user as any).watchlist;
    return Array.isArray(wl) && wl.length > 0 ? wl : null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const enabledStrategies = (searchParams.get('strategies') ?? 'rsi').split(',').filter(Boolean);
  const timeframeId = (searchParams.get('timeframe') ?? 'medium') as TimeframeId;
  const tf = TIMEFRAME_PRESETS[timeframeId] ?? TIMEFRAME_PRESETS.medium;

  // Load user's watchlist; fall back to hardcoded defaults
  const userWatchlist = await getUserWatchlist();
  const watchlist: WatchlistAsset[] = userWatchlist ?? ASSETS.map((a) => ({
    symbol: a.symbol, name: a.name, type: a.type, stooqSymbol: a.stooqSymbol, geckoId: a.geckoId,
  }));

  const now = Date.now();
  const assets: AssetData[] = [];
  let fetchCount = 0;

  for (const asset of watchlist) {
    const cacheKey = `${asset.symbol}:${timeframeId}`;
    const cached = _assetCache.get(cacheKey);

    if (cached && now < cached.expiresAt) {
      // Re-combine signal with current enabled strategies
      const a = cached.data;
      if (!a.error) {
        const allSignals = {
          rsi: { signal: a.strategySignals.rsi?.signal ?? ('LOADING' as const), value: a.rsi },
          macd: { signal: a.strategySignals.macd?.signal ?? ('LOADING' as const), data: (a.strategySignals.macd?.data as any) ?? null },
          bb: { signal: a.strategySignals.bb?.signal ?? ('LOADING' as const), data: (a.strategySignals.bb?.data as any) ?? null },
          ma_cross: { signal: a.strategySignals.ma_cross?.signal ?? ('LOADING' as const), data: (a.strategySignals.ma_cross?.data as any) ?? null },
        };
        const signal = combineSignals(allSignals, enabledStrategies);
        const sltp = (signal === 'BUY' || signal === 'SELL') ? a.sltp : null;
        assets.push({ ...a, signal, sltp });
      } else {
        assets.push(a);
      }
      continue;
    }

    // Cache miss — fetch fresh
    if (fetchCount > 0) await delay(DELAY_MS);
    const data = await fetchAssetData(asset, enabledStrategies, tf);
    fetchCount++;

    if (!data.error) {
      _assetCache.set(cacheKey, { data, expiresAt: now + CACHE_TTL });
    }
    assets.push(data);
  }

  return NextResponse.json(
    { assets, fetchedAt: new Date().toISOString() } satisfies ApiAssetsResponse,
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
