/**
 * Average True Range (ATR) — measures volatility.
 *
 * True Range = max of:
 *   1. High - Low
 *   2. |High - Previous Close|
 *   3. |Low - Previous Close|
 *
 * ATR = Wilder's smoothed average of True Range over `period` days.
 *
 * Used to calculate dynamic stop-loss and take-profit levels
 * that adapt to each asset's volatility.
 */

export interface ATRResult {
  atr: number;
  atrPct: number; // ATR as % of current price
}

export function calculateATR(
  highs: number[],
  lows: number[],
  closes: number[],
  period = 14,
): ATRResult | null {
  if (closes.length < period + 1) return null;

  const trueRanges: number[] = [];
  for (let i = 1; i < closes.length; i++) {
    const tr = Math.max(
      highs[i] - lows[i],
      Math.abs(highs[i] - closes[i - 1]),
      Math.abs(lows[i] - closes[i - 1]),
    );
    trueRanges.push(tr);
  }

  // Seed: simple average of first `period` true ranges
  let atr = trueRanges.slice(0, period).reduce((a, b) => a + b, 0) / period;

  // Wilder's smoothing
  for (let i = period; i < trueRanges.length; i++) {
    atr = (atr * (period - 1) + trueRanges[i]) / period;
  }

  const currentPrice = closes[closes.length - 1];
  return {
    atr: Math.round(atr * 100) / 100,
    atrPct: currentPrice > 0 ? Math.round((atr / currentPrice) * 10000) / 100 : 0,
  };
}

export interface SLTPLevels {
  stopLoss: number;
  takeProfit: number;
  riskReward: number; // TP distance / SL distance
  atr: number;
  atrPct: number;
}

/**
 * Calculate stop-loss and take-profit levels based on ATR.
 *
 * For BUY signals:  SL = price - slMultiplier * ATR,  TP = price + tpMultiplier * ATR
 * For SELL signals: SL = price + slMultiplier * ATR,  TP = price - tpMultiplier * ATR
 *
 * Default: 1.5x ATR stop-loss, 3x ATR take-profit (1:2 R:R)
 */
export function calculateSLTP(
  highs: number[],
  lows: number[],
  closes: number[],
  signal: 'BUY' | 'SELL',
  slMultiplier = 1.5,
  tpMultiplier = 3,
): SLTPLevels | null {
  const atrResult = calculateATR(highs, lows, closes);
  if (!atrResult) return null;

  const price = closes[closes.length - 1];
  const { atr, atrPct } = atrResult;

  let stopLoss: number;
  let takeProfit: number;

  if (signal === 'BUY') {
    stopLoss = price - slMultiplier * atr;
    takeProfit = price + tpMultiplier * atr;
  } else {
    stopLoss = price + slMultiplier * atr;
    takeProfit = price - tpMultiplier * atr;
  }

  const riskReward = Math.round((tpMultiplier / slMultiplier) * 10) / 10;

  return {
    stopLoss: Math.round(stopLoss * 100) / 100,
    takeProfit: Math.round(takeProfit * 100) / 100,
    riskReward,
    atr,
    atrPct,
  };
}
