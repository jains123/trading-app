import type { SignalType } from './types';

/**
 * Moving Average Crossover (50/200 EMA)
 *
 * Golden Cross: 50 EMA crosses above 200 EMA → BUY
 * Death Cross:  50 EMA crosses below 200 EMA → SELL
 *
 * This is a long-term trend-following strategy.
 * With 90 days of daily data we have enough for the 50 EMA
 * but not a true 200 EMA. We use a 50/20 EMA crossover instead
 * (short-term trend version), which is commonly used for
 * shorter timeframes and intraday/swing trading.
 */

function ema(data: number[], period: number): number[] {
  const k = 2 / (period + 1);
  const result: number[] = [data[0]];
  for (let i = 1; i < data.length; i++) {
    result.push(data[i] * k + result[i - 1] * (1 - k));
  }
  return result;
}

export interface MACrossResult {
  emaFast: number;   // 20 EMA
  emaSlow: number;   // 50 EMA
  spread: number;    // fast - slow (positive = bullish)
}

export function calculateMACross(
  closes: number[],
  fastPeriod = 20,
  slowPeriod = 50,
): MACrossResult | null {
  if (closes.length < slowPeriod + 2) return null;

  const fast = ema(closes, fastPeriod);
  const slow = ema(closes, slowPeriod);

  const last = closes.length - 1;
  return {
    emaFast: Math.round(fast[last] * 100) / 100,
    emaSlow: Math.round(slow[last] * 100) / 100,
    spread: Math.round((fast[last] - slow[last]) * 100) / 100,
  };
}

export function getMACrossSignal(closes: number[]): { signal: SignalType; data: MACrossResult | null } {
  if (closes.length < 52) return { signal: 'LOADING', data: null };

  const fast = ema(closes, 20);
  const slow = ema(closes, 50);

  const last = closes.length - 1;
  const prev = last - 1;

  const currentSpread = fast[last] - slow[last];
  const prevSpread = fast[prev] - slow[prev];

  const data: MACrossResult = {
    emaFast: Math.round(fast[last] * 100) / 100,
    emaSlow: Math.round(slow[last] * 100) / 100,
    spread: Math.round(currentSpread * 100) / 100,
  };

  // Golden cross: fast crosses above slow
  if (prevSpread <= 0 && currentSpread > 0) {
    return { signal: 'BUY', data };
  }
  // Death cross: fast crosses below slow
  if (prevSpread >= 0 && currentSpread < 0) {
    return { signal: 'SELL', data };
  }

  return { signal: 'HOLD', data };
}
