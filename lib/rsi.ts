/**
 * Wilder's Smoothed RSI
 * Standard 14-period RSI used in trading platforms.
 * Returns null if not enough data, otherwise 0-100.
 */
export function calculateRSI(closes: number[], period = 14): number | null {
  if (closes.length < period + 1) return null;

  const changes: number[] = [];
  for (let i = 1; i < closes.length; i++) {
    changes.push(closes[i] - closes[i - 1]);
  }

  // Seed: simple average of first `period` changes
  let avgGain = 0;
  let avgLoss = 0;
  for (let i = 0; i < period; i++) {
    const c = changes[i];
    if (c >= 0) avgGain += c;
    else avgLoss += Math.abs(c);
  }
  avgGain /= period;
  avgLoss /= period;

  // Wilder's smoothing for subsequent values
  for (let i = period; i < changes.length; i++) {
    const c = changes[i];
    const gain = c >= 0 ? c : 0;
    const loss = c < 0 ? Math.abs(c) : 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
  }

  if (avgLoss === 0) return 100;
  if (avgGain === 0) return 0;

  const rs = avgGain / avgLoss;
  return Math.round((100 - 100 / (1 + rs)) * 10) / 10;
}

export function getSignal(
  rsi: number | null,
  buyThreshold = 30,
  sellThreshold = 70,
) {
  if (rsi === null) return 'LOADING' as const;
  if (rsi <= buyThreshold) return 'BUY' as const;
  if (rsi >= sellThreshold) return 'SELL' as const;
  return 'HOLD' as const;
}
