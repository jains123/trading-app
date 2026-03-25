import type { SignalType } from './types';

/**
 * Bollinger Bands
 *
 * Standard 20-period SMA with 2 standard deviation bands.
 *   - Upper Band = SMA(20) + 2 * StdDev
 *   - Lower Band = SMA(20) - 2 * StdDev
 *
 * BUY when price touches/drops below lower band (oversold)
 * SELL when price touches/rises above upper band (overbought)
 */

export interface BollingerResult {
  upper: number;
  middle: number;
  lower: number;
  bandwidth: number;  // (upper - lower) / middle — measures volatility
  percentB: number;   // (price - lower) / (upper - lower) — where price sits in bands
}

export function calculateBollinger(
  closes: number[],
  period = 20,
  stdDevMultiplier = 2,
): BollingerResult | null {
  if (closes.length < period) return null;

  const slice = closes.slice(-period);
  const sma = slice.reduce((a, b) => a + b, 0) / period;

  const variance = slice.reduce((sum, val) => sum + (val - sma) ** 2, 0) / period;
  const stdDev = Math.sqrt(variance);

  const upper = sma + stdDevMultiplier * stdDev;
  const lower = sma - stdDevMultiplier * stdDev;
  const currentPrice = closes[closes.length - 1];
  const bandwidth = sma !== 0 ? (upper - lower) / sma : 0;
  const percentB = upper !== lower ? (currentPrice - lower) / (upper - lower) : 0.5;

  return {
    upper: Math.round(upper * 100) / 100,
    middle: Math.round(sma * 100) / 100,
    lower: Math.round(lower * 100) / 100,
    bandwidth: Math.round(bandwidth * 10000) / 10000,
    percentB: Math.round(percentB * 1000) / 1000,
  };
}

export function getBollingerSignal(
  closes: number[],
  period = 20,
  stdDevMultiplier = 2,
): { signal: SignalType; data: BollingerResult | null } {
  if (closes.length < period) return { signal: 'LOADING', data: null };

  const result = calculateBollinger(closes, period, stdDevMultiplier);
  if (!result) return { signal: 'LOADING', data: null };

  // %B below 0 = price below lower band (oversold)
  // %B above 1 = price above upper band (overbought)
  if (result.percentB <= 0) return { signal: 'BUY', data: result };
  if (result.percentB >= 1) return { signal: 'SELL', data: result };

  return { signal: 'HOLD', data: result };
}
