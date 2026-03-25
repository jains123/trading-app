/**
 * Backtesting Engine
 *
 * Simulates trades on historical price data using strategy signals.
 * Supports stop-loss and take-profit exits based on ATR.
 *
 * For each day in the dataset:
 *   1. Calculate strategy signals using data up to that day
 *   2. If not in a trade and signal is BUY → enter long
 *   3. If in a trade:
 *      a. Check if SL or TP hit (using high/low of the day)
 *      b. If signal flips to SELL → exit
 *   4. Record trade result
 */

import { calculateAllStrategies, combineSignals } from './strategies';
import { calculateATR } from './atr';
import type { SignalType } from './types';

export interface Trade {
  entryDay: number;
  exitDay: number;
  entryPrice: number;
  exitPrice: number;
  returnPct: number;
  exitReason: 'signal' | 'stop_loss' | 'take_profit';
  direction: 'long' | 'short';
}

export interface BacktestResult {
  totalReturn: number;     // cumulative % return
  winRate: number;         // % of winning trades
  tradeCount: number;
  avgWin: number;          // avg % gain on winners
  avgLoss: number;         // avg % loss on losers
  maxDrawdown: number;     // worst peak-to-trough %
  profitFactor: number;    // gross profit / gross loss
  avgRR: number;           // average risk:reward achieved
  trades: Trade[];
}

const MIN_DATA_POINTS = 55; // need enough for 50 EMA + buffer
const SL_MULTIPLIER = 1.5;
const TP_MULTIPLIER = 3;

export function runBacktest(
  closes: number[],
  highs: number[],
  lows: number[],
  enabledStrategies: string[],
  buyThreshold = 30,
  sellThreshold = 70,
): BacktestResult | null {
  if (closes.length < MIN_DATA_POINTS) return null;

  const trades: Trade[] = [];
  let inTrade = false;
  let entryPrice = 0;
  let entryDay = 0;
  let stopLoss = 0;
  let takeProfit = 0;
  let direction: 'long' | 'short' = 'long';

  // Walk forward through the data, using only past data for signals
  for (let day = MIN_DATA_POINTS; day < closes.length; day++) {
    const pastCloses = closes.slice(0, day + 1);
    const pastHighs = highs.slice(0, day + 1);
    const pastLows = lows.slice(0, day + 1);

    const allSignals = calculateAllStrategies(pastCloses, buyThreshold, sellThreshold);
    const signal = combineSignals(allSignals, enabledStrategies);

    if (inTrade) {
      // Check SL/TP using today's high/low
      const dayHigh = highs[day];
      const dayLow = lows[day];
      let exitPrice = 0;
      let exitReason: Trade['exitReason'] = 'signal';

      if (direction === 'long') {
        if (dayLow <= stopLoss) {
          exitPrice = stopLoss;
          exitReason = 'stop_loss';
        } else if (dayHigh >= takeProfit) {
          exitPrice = takeProfit;
          exitReason = 'take_profit';
        } else if (signal === 'SELL') {
          exitPrice = closes[day];
          exitReason = 'signal';
        }
      } else {
        if (dayHigh >= stopLoss) {
          exitPrice = stopLoss;
          exitReason = 'stop_loss';
        } else if (dayLow <= takeProfit) {
          exitPrice = takeProfit;
          exitReason = 'take_profit';
        } else if (signal === 'BUY') {
          exitPrice = closes[day];
          exitReason = 'signal';
        }
      }

      if (exitPrice > 0) {
        const returnPct = direction === 'long'
          ? ((exitPrice - entryPrice) / entryPrice) * 100
          : ((entryPrice - exitPrice) / entryPrice) * 100;

        trades.push({
          entryDay,
          exitDay: day,
          entryPrice,
          exitPrice,
          returnPct: Math.round(returnPct * 100) / 100,
          exitReason,
          direction,
        });
        inTrade = false;
      }
    }

    if (!inTrade && (signal === 'BUY' || signal === 'SELL')) {
      const atr = calculateATR(pastHighs, pastLows, pastCloses);
      if (!atr) continue;

      inTrade = true;
      entryPrice = closes[day];
      entryDay = day;
      direction = signal === 'BUY' ? 'long' : 'short';

      if (direction === 'long') {
        stopLoss = entryPrice - SL_MULTIPLIER * atr.atr;
        takeProfit = entryPrice + TP_MULTIPLIER * atr.atr;
      } else {
        stopLoss = entryPrice + SL_MULTIPLIER * atr.atr;
        takeProfit = entryPrice - TP_MULTIPLIER * atr.atr;
      }
    }
  }

  // Close any open trade at last price
  if (inTrade) {
    const exitPrice = closes[closes.length - 1];
    const returnPct = direction === 'long'
      ? ((exitPrice - entryPrice) / entryPrice) * 100
      : ((entryPrice - exitPrice) / entryPrice) * 100;

    trades.push({
      entryDay,
      exitDay: closes.length - 1,
      entryPrice,
      exitPrice,
      returnPct: Math.round(returnPct * 100) / 100,
      exitReason: 'signal',
      direction,
    });
  }

  return computeStats(trades);
}

function computeStats(trades: Trade[]): BacktestResult {
  if (trades.length === 0) {
    return {
      totalReturn: 0,
      winRate: 0,
      tradeCount: 0,
      avgWin: 0,
      avgLoss: 0,
      maxDrawdown: 0,
      profitFactor: 0,
      avgRR: 0,
      trades: [],
    };
  }

  const winners = trades.filter((t) => t.returnPct > 0);
  const losers = trades.filter((t) => t.returnPct <= 0);

  const grossProfit = winners.reduce((s, t) => s + t.returnPct, 0);
  const grossLoss = Math.abs(losers.reduce((s, t) => s + t.returnPct, 0));

  // Compounded total return
  let equity = 100;
  let peak = equity;
  let maxDrawdown = 0;

  for (const trade of trades) {
    equity *= 1 + trade.returnPct / 100;
    if (equity > peak) peak = equity;
    const dd = ((peak - equity) / peak) * 100;
    if (dd > maxDrawdown) maxDrawdown = dd;
  }

  const totalReturn = Math.round((equity - 100) * 100) / 100;
  const winRate = Math.round((winners.length / trades.length) * 10000) / 100;
  const avgWin = winners.length > 0
    ? Math.round((grossProfit / winners.length) * 100) / 100
    : 0;
  const avgLoss = losers.length > 0
    ? Math.round((grossLoss / losers.length) * -100) / 100
    : 0;
  const profitFactor = grossLoss > 0
    ? Math.round((grossProfit / grossLoss) * 100) / 100
    : grossProfit > 0 ? Infinity : 0;
  const avgRR = avgLoss !== 0
    ? Math.round((avgWin / Math.abs(avgLoss)) * 10) / 10
    : 0;

  return {
    totalReturn,
    winRate,
    tradeCount: trades.length,
    avgWin,
    avgLoss,
    maxDrawdown: Math.round(maxDrawdown * 100) / 100,
    profitFactor,
    avgRR,
    trades,
  };
}
