'use client';

import { Shield, Target, TrendingDown, TrendingUp } from 'lucide-react';
import type { AssetData } from '@/lib/types';
import SignalBadge from './SignalBadge';
import RsiMeter from './RsiMeter';
import Sparkline from './Sparkline';

const STRATEGY_LABELS: Record<string, string> = {
  rsi: 'RSI',
  macd: 'MACD',
  bb: 'BB',
  ma_cross: 'MA',
};

function formatPrice(price: number, symbol: string): string {
  if (price === 0) return '—';
  const isCrypto = symbol.endsWith('-USD');
  if (price > 10000) return `$${price.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  if (price > 1000) return `$${price.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
  if (isCrypto && price < 1) return `$${price.toFixed(4)}`;
  return `$${price.toFixed(2)}`;
}

function fmtCompact(price: number): string {
  if (price > 10000) return `$${Math.round(price).toLocaleString('en-US')}`;
  if (price > 100) return `$${price.toFixed(2)}`;
  if (price < 0.01) return `$${price.toFixed(6)}`;
  if (price < 1) return `$${price.toFixed(4)}`;
  return `$${price.toFixed(2)}`;
}

const SIGNAL_COLORS: Record<string, string> = {
  BUY: 'text-[#3fb950]',
  SELL: 'text-[#f85149]',
  HOLD: 'text-[#d29922]',
  LOADING: 'text-[#8b949e]',
  ERROR: 'text-[#8b949e]',
};

const SIGNAL_BG: Record<string, string> = {
  BUY: 'bg-[#3fb950]/10',
  SELL: 'bg-[#f85149]/10',
  HOLD: 'bg-[#d29922]/10',
  LOADING: 'bg-[#8b949e]/10',
  ERROR: 'bg-[#8b949e]/10',
};

export default function AssetCard({
  data,
  buyThreshold,
  sellThreshold,
  enabledStrategies,
}: {
  data: AssetData;
  buyThreshold: number;
  sellThreshold: number;
  enabledStrategies: string[];
}) {
  const up = data.priceChangePct >= 0;
  const showBreakdown = enabledStrategies.length > 1 && data.strategySignals && !data.error;
  const hasSltp = data.sltp && (data.signal === 'BUY' || data.signal === 'SELL');
  const nearbyLevels = (data.levels ?? []).slice(0, 4);

  return (
    <div
      className={`
        relative bg-[#161b22] border rounded-xl p-4 flex flex-col gap-3
        transition-all duration-200 hover:border-[#58a6ff]/30 hover:bg-[#1c2128]
        ${
          data.signal === 'BUY'
            ? 'border-[#3fb950]/40'
            : data.signal === 'SELL'
              ? 'border-[#f85149]/40'
              : 'border-[#30363d]'
        }
        ${data.error ? 'opacity-50' : ''}
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-[#e6edf3] text-sm">{data.symbol.replace('-USD', '')}</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded font-medium uppercase tracking-wide ${
                data.type === 'crypto'
                  ? 'bg-[#58a6ff]/10 text-[#58a6ff]'
                  : 'bg-[#8b949e]/10 text-[#8b949e]'
              }`}
            >
              {data.type === 'crypto' ? 'CRYPTO' : 'STOCK'}
            </span>
          </div>
          <p className="text-[#8b949e] text-xs mt-0.5">{data.name}</p>
        </div>
        <SignalBadge signal={data.signal} />
      </div>

      {/* Price */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xl font-mono font-semibold text-[#e6edf3] leading-none">
            {formatPrice(data.price, data.symbol)}
          </p>
          <p className={`text-xs mt-1 font-mono ${up ? 'text-[#3fb950]' : 'text-[#f85149]'}`}>
            {up ? '+' : ''}
            {data.priceChangePct.toFixed(2)}%{' '}
            <span className="text-[#8b949e]">(24h)</span>
          </p>
        </div>
        <Sparkline data={data.sparkline} positive={up} width={100} height={34} />
      </div>

      {/* RSI meter */}
      {enabledStrategies.includes('rsi') && (
        <RsiMeter rsi={data.rsi} buyThreshold={buyThreshold} sellThreshold={sellThreshold} />
      )}

      {/* Per-strategy signal breakdown */}
      {showBreakdown && (
        <div className="flex gap-1.5 flex-wrap">
          {enabledStrategies.map((stratId) => {
            const detail = data.strategySignals[stratId];
            if (!detail) return null;
            const label = STRATEGY_LABELS[stratId] ?? stratId;
            return (
              <div
                key={stratId}
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold ${SIGNAL_BG[detail.signal]} ${SIGNAL_COLORS[detail.signal]}`}
              >
                <span className="opacity-70 text-[#8b949e]">{label}</span>
                <span>{detail.signal === 'LOADING' ? '...' : detail.signal}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Stop-Loss / Take-Profit */}
      {hasSltp && data.sltp && (
        <div className="bg-[#0d1117] rounded-lg px-3 py-2 space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Shield size={10} className="text-[#f85149]" />
              <span className="text-[10px] text-[#8b949e]">Stop Loss</span>
            </div>
            <span className="text-[11px] font-mono text-[#f85149] font-semibold">
              {fmtCompact(data.sltp.stopLoss)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Target size={10} className="text-[#3fb950]" />
              <span className="text-[10px] text-[#8b949e]">Take Profit</span>
            </div>
            <span className="text-[11px] font-mono text-[#3fb950] font-semibold">
              {fmtCompact(data.sltp.takeProfit)}
            </span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-[#30363d]/50">
            <span className="text-[10px] text-[#8b949e]">R:R</span>
            <span className="text-[10px] font-mono text-[#58a6ff] font-semibold">
              1:{data.sltp.riskReward}
            </span>
          </div>
        </div>
      )}

      {/* Support / Resistance levels */}
      {nearbyLevels.length > 0 && !data.error && (
        <div className="flex gap-1.5 flex-wrap">
          {nearbyLevels.map((level, i) => (
            <div
              key={i}
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] ${
                level.type === 'support'
                  ? 'bg-[#3fb950]/8 text-[#3fb950]'
                  : 'bg-[#f85149]/8 text-[#f85149]'
              }`}
            >
              {level.type === 'support' ? (
                <TrendingDown size={8} />
              ) : (
                <TrendingUp size={8} />
              )}
              <span className="font-mono font-semibold">{fmtCompact(level.price)}</span>
              {level.strength > 1 && (
                <span className="opacity-50">x{level.strength}</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Backtest summary */}
      {data.backtest && data.backtest.tradeCount > 0 && !data.error && (
        <div className="flex items-center gap-2 text-[9px] text-[#8b949e] border-t border-[#30363d]/50 pt-2">
          <span className={`font-semibold font-mono ${data.backtest.totalReturn >= 0 ? 'text-[#3fb950]' : 'text-[#f85149]'}`}>
            {data.backtest.totalReturn >= 0 ? '+' : ''}{data.backtest.totalReturn}%
          </span>
          <span className="opacity-50">|</span>
          <span>{data.backtest.winRate}% win</span>
          <span className="opacity-50">|</span>
          <span>{data.backtest.tradeCount} trades</span>
          <span className="opacity-50">|</span>
          <span className="text-[#f85149]">-{data.backtest.maxDrawdown}% dd</span>
        </div>
      )}

      {data.error && (
        <p className="text-[10px] text-[#f85149] text-center">Failed to fetch</p>
      )}
    </div>
  );
}
