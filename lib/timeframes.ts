/**
 * Holding Timeframe Presets
 *
 * Each preset adjusts all indicator parameters to suit the intended
 * holding period. Shorter timeframes use faster, more sensitive
 * indicators; longer timeframes use slower, smoother ones.
 *
 * Short-term: RSI(7), MACD(6/13/5), BB(10,1.5), MA(9/21)
 *   → Tighter thresholds catch quick reversals. SL/TP are tighter.
 *
 * Medium-term: RSI(14), MACD(12/26/9), BB(20,2), MA(20/50)
 *   → Industry-standard defaults. Balanced approach.
 *
 * Long-term: RSI(21), MACD(19/39/9), BB(30,2.5), MA(30/60)
 *   → Wider thresholds require stronger conviction. Bigger SL/TP.
 */

export type TimeframeId = 'short' | 'medium' | 'long';

export interface TimeframePreset {
  id: TimeframeId;
  name: string;
  label: string;
  description: string;
  rsiPeriod: number;
  rsiBuyThreshold: number;
  rsiSellThreshold: number;
  macdFast: number;
  macdSlow: number;
  macdSignal: number;
  bbPeriod: number;
  bbStdDev: number;
  maCrossFast: number;
  maCrossSlow: number;
  atrPeriod: number;
  slMultiplier: number;
  tpMultiplier: number;
}

export const TIMEFRAME_PRESETS: Record<TimeframeId, TimeframePreset> = {
  short: {
    id: 'short',
    name: 'Short-term',
    label: '1–5 days',
    description: 'Tighter thresholds, faster indicators for quick swing trades',
    rsiPeriod: 7,
    rsiBuyThreshold: 25,
    rsiSellThreshold: 75,
    macdFast: 6,
    macdSlow: 13,
    macdSignal: 5,
    bbPeriod: 10,
    bbStdDev: 1.5,
    maCrossFast: 9,
    maCrossSlow: 21,
    atrPeriod: 7,
    slMultiplier: 1,
    tpMultiplier: 2,
  },
  medium: {
    id: 'medium',
    name: 'Medium-term',
    label: '1–4 weeks',
    description: 'Standard parameters, balanced approach',
    rsiPeriod: 14,
    rsiBuyThreshold: 30,
    rsiSellThreshold: 70,
    macdFast: 12,
    macdSlow: 26,
    macdSignal: 9,
    bbPeriod: 20,
    bbStdDev: 2,
    maCrossFast: 20,
    maCrossSlow: 50,
    atrPeriod: 14,
    slMultiplier: 1.5,
    tpMultiplier: 3,
  },
  long: {
    id: 'long',
    name: 'Long-term',
    label: '1–3 months',
    description: 'Wider thresholds, slower indicators for position trades',
    rsiPeriod: 21,
    rsiBuyThreshold: 35,
    rsiSellThreshold: 65,
    macdFast: 19,
    macdSlow: 39,
    macdSignal: 9,
    bbPeriod: 30,
    bbStdDev: 2.5,
    maCrossFast: 30,
    maCrossSlow: 60,
    atrPeriod: 21,
    slMultiplier: 2,
    tpMultiplier: 4,
  },
};
