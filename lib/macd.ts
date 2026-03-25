import type { SignalType } from './types';

/**
 * MACD — Moving Average Convergence/Divergence
 *
 * Uses the standard 12/26/9 configuration:
 *   - MACD line = EMA(12) - EMA(26)
 *   - Signal line = EMA(9) of MACD line
 *   - Histogram = MACD - Signal
 *
 * BUY when MACD crosses above signal line (bullish crossover)
 * SELL when MACD crosses below signal line (bearish crossover)
 */

function ema(data: number[], period: number): number[] {
  const k = 2 / (period + 1);
  const result: number[] = [data[0]];
  for (let i = 1; i < data.length; i++) {
    result.push(data[i] * k + result[i - 1] * (1 - k));
  }
  return result;
}

export interface MACDResult {
  macdLine: number;
  signalLine: number;
  histogram: number;
}

export function calculateMACD(
  closes: number[],
  fastPeriod = 12,
  slowPeriod = 26,
  signalPeriod = 9,
): MACDResult | null {
  // Need at least slowPeriod + signalPeriod data points
  if (closes.length < slowPeriod + signalPeriod) return null;

  const emaFast = ema(closes, fastPeriod);
  const emaSlow = ema(closes, slowPeriod);

  // MACD line = fast EMA - slow EMA
  const macdLine: number[] = [];
  for (let i = 0; i < closes.length; i++) {
    macdLine.push(emaFast[i] - emaSlow[i]);
  }

  // Signal line = EMA of MACD line
  const signalLineArr = ema(macdLine, signalPeriod);

  const last = closes.length - 1;
  return {
    macdLine: Math.round(macdLine[last] * 1000) / 1000,
    signalLine: Math.round(signalLineArr[last] * 1000) / 1000,
    histogram: Math.round((macdLine[last] - signalLineArr[last]) * 1000) / 1000,
  };
}

export function getMACDSignal(
  closes: number[],
  fastPeriod = 12,
  slowPeriod = 26,
  signalPeriod = 9,
): { signal: SignalType; data: MACDResult | null } {
  const minLen = slowPeriod + signalPeriod + 1;
  if (closes.length < minLen) return { signal: 'LOADING', data: null };

  const current = calculateMACD(closes, fastPeriod, slowPeriod, signalPeriod);
  const prev = calculateMACD(closes.slice(0, -1), fastPeriod, slowPeriod, signalPeriod);

  if (!current || !prev) return { signal: 'LOADING', data: null };

  // Bullish crossover: MACD crosses above signal
  if (prev.histogram <= 0 && current.histogram > 0) {
    return { signal: 'BUY', data: current };
  }
  // Bearish crossover: MACD crosses below signal
  if (prev.histogram >= 0 && current.histogram < 0) {
    return { signal: 'SELL', data: current };
  }

  return { signal: 'HOLD', data: current };
}
