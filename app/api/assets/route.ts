import { NextRequest, NextResponse } from 'next/server';
import { ASSETS } from '@/lib/assets';
import { fetchStooqStock } from '@/lib/stooq';
import { fetchCoinGecko } from '@/lib/coingecko';
import { calculateAllStrategies, combineSignals } from '@/lib/strategies';
import { calculateSLTP } from '@/lib/atr';
import { detectLevels } from '@/lib/levels';
import { runBacktest } from '@/lib/backtest';
import type { AssetData, ApiAssetsResponse, StrategyDetail } from '@/lib/types';

const SPARKLINE_POINTS = 24;
const DELAY_MS = 500;
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
  enabledStrategies: string[],
): Promise<AssetData> {
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

    // Calculate all strategy signals
    const allSignals = calculateAllStrategies(closes, buyThreshold, sellThreshold);

    // Build per-strategy detail map
    const strategySignals: Record<string, StrategyDetail> = {
      rsi: { signal: allSignals.rsi.signal, value: allSignals.rsi.value },
      macd: {
        signal: allSignals.macd.signal,
        data: allSignals.macd.data ? { ...allSignals.macd.data } : null,
      },
      bb: {
        signal: allSignals.bb.signal,
        data: allSignals.bb.data ? { ...allSignals.bb.data } : null,
      },
      ma_cross: {
        signal: allSignals.ma_cross.signal,
        data: allSignals.ma_cross.data ? { ...allSignals.ma_cross.data } : null,
      },
    };

    // Combined signal based on enabled strategies
    const signal = combineSignals(allSignals, enabledStrategies);

    // SL/TP — only calculated when there's an actionable signal
    const sltp = (signal === 'BUY' || signal === 'SELL')
      ? calculateSLTP(highs, lows, closes, signal)
      : null;

    // Support/Resistance levels
    const levels = detectLevels(closes);

    // Backtest
    const backtestResult = runBacktest(closes, highs, lows, enabledStrategies, buyThreshold, sellThreshold);
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
      symbol,
      name,
      type,
      price: currentPrice,
      priceChange,
      priceChangePct,
      rsi: allSignals.rsi.value,
      signal,
      strategySignals,
      sltp,
      levels,
      backtest,
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
      strategySignals: {},
      sltp: null,
      levels: [],
      backtest: null,
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
  const enabledStrategies = (searchParams.get('strategies') ?? 'rsi').split(',').filter(Boolean);

  // Serve cache if fresh
  if (_cache && Date.now() < _cache.expiresAt) {
    // Re-combine signals with the requested enabled strategies
    const cachedAssets = _cache.data.assets.map((asset) => {
      if (asset.error) return asset;
      const allSignals = {
        rsi: { signal: asset.strategySignals.rsi?.signal ?? ('LOADING' as const), value: asset.rsi },
        macd: { signal: asset.strategySignals.macd?.signal ?? ('LOADING' as const), data: (asset.strategySignals.macd?.data as any) ?? null },
        bb: { signal: asset.strategySignals.bb?.signal ?? ('LOADING' as const), data: (asset.strategySignals.bb?.data as any) ?? null },
        ma_cross: { signal: asset.strategySignals.ma_cross?.signal ?? ('LOADING' as const), data: (asset.strategySignals.ma_cross?.data as any) ?? null },
      };
      const signal = combineSignals(allSignals, enabledStrategies);
      // SL/TP needs recalculation when signal changes
      // We don't have raw high/low data in cache, so clear sltp if signal changed
      const sltp = (signal === 'BUY' || signal === 'SELL') ? asset.sltp : null;
      return { ...asset, signal, sltp };
    });

    return NextResponse.json(
      { assets: cachedAssets, fetchedAt: _cache.data.fetchedAt },
      { headers: { 'Cache-Control': 'no-store', 'X-Cache': 'HIT' } },
    );
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
      enabledStrategies,
    );
    assets.push(data);
    if (i < ASSETS.length - 1) await delay(DELAY_MS);
  }

  const response: ApiAssetsResponse = {
    assets,
    fetchedAt: new Date().toISOString(),
  };

  // Only cache when ALL assets succeed
  if (assets.every((a) => !a.error)) {
    _cache = { data: response, expiresAt: Date.now() + CACHE_TTL };
  }

  return NextResponse.json(response, { headers: { 'Cache-Control': 'no-store' } });
}
