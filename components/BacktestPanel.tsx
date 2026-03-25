'use client';

import { BarChart2, TrendingUp, TrendingDown, Target, AlertTriangle } from 'lucide-react';
import type { AssetData } from '@/lib/types';

interface Props {
  assets: AssetData[];
}

export default function BacktestPanel({ assets }: Props) {
  const withBacktest = assets.filter((a) => a.backtest && a.backtest.tradeCount > 0);

  if (withBacktest.length === 0) return null;

  // Aggregate stats across all assets
  const totalTrades = withBacktest.reduce((s, a) => s + (a.backtest?.tradeCount ?? 0), 0);
  const avgWinRate = withBacktest.reduce((s, a) => s + (a.backtest?.winRate ?? 0), 0) / withBacktest.length;
  const avgReturn = withBacktest.reduce((s, a) => s + (a.backtest?.totalReturn ?? 0), 0) / withBacktest.length;
  const worstDrawdown = Math.max(...withBacktest.map((a) => a.backtest?.maxDrawdown ?? 0));
  const avgPF = withBacktest.reduce((s, a) => s + (a.backtest?.profitFactor ?? 0), 0) / withBacktest.length;

  // Best and worst performers
  const sorted = [...withBacktest].sort(
    (a, b) => (b.backtest?.totalReturn ?? 0) - (a.backtest?.totalReturn ?? 0),
  );
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];

  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        <BarChart2 size={16} className="text-[#d29922]" />
        <h2 className="text-sm font-semibold text-[#e6edf3]">Backtest</h2>
        <span className="text-[9px] text-[#8b949e] ml-auto">90-day</span>
      </div>

      {/* Aggregate stats */}
      <div className="grid grid-cols-2 gap-2">
        <StatBox
          label="Avg Return"
          value={`${avgReturn >= 0 ? '+' : ''}${avgReturn.toFixed(1)}%`}
          color={avgReturn >= 0 ? 'text-[#3fb950]' : 'text-[#f85149]'}
        />
        <StatBox
          label="Win Rate"
          value={`${avgWinRate.toFixed(1)}%`}
          color={avgWinRate >= 50 ? 'text-[#3fb950]' : 'text-[#d29922]'}
        />
        <StatBox
          label="Profit Factor"
          value={avgPF === Infinity ? '∞' : avgPF.toFixed(2)}
          color={avgPF >= 1 ? 'text-[#3fb950]' : 'text-[#f85149]'}
        />
        <StatBox
          label="Max Drawdown"
          value={`-${worstDrawdown.toFixed(1)}%`}
          color="text-[#f85149]"
        />
      </div>

      <div className="text-[10px] text-[#8b949e] text-center">
        {totalTrades} total trades across {withBacktest.length} assets
      </div>

      {/* Best / Worst performers */}
      <div className="space-y-1.5 pt-2 border-t border-[#30363d]">
        {best && best.backtest && (
          <div className="flex items-center gap-2">
            <TrendingUp size={10} className="text-[#3fb950]" />
            <span className="text-[10px] text-[#8b949e]">Best</span>
            <span className="text-[10px] font-mono text-[#e6edf3] font-semibold">
              {best.symbol.replace('-USD', '')}
            </span>
            <span className={`text-[10px] font-mono ml-auto font-semibold ${best.backtest.totalReturn >= 0 ? 'text-[#3fb950]' : 'text-[#f85149]'}`}>
              {best.backtest.totalReturn >= 0 ? '+' : ''}{best.backtest.totalReturn}%
            </span>
          </div>
        )}
        {worst && worst.backtest && worst !== best && (
          <div className="flex items-center gap-2">
            <TrendingDown size={10} className="text-[#f85149]" />
            <span className="text-[10px] text-[#8b949e]">Worst</span>
            <span className="text-[10px] font-mono text-[#e6edf3] font-semibold">
              {worst.symbol.replace('-USD', '')}
            </span>
            <span className={`text-[10px] font-mono ml-auto font-semibold ${worst.backtest.totalReturn >= 0 ? 'text-[#3fb950]' : 'text-[#f85149]'}`}>
              {worst.backtest.totalReturn >= 0 ? '+' : ''}{worst.backtest.totalReturn}%
            </span>
          </div>
        )}
      </div>

      {/* Per-asset breakdown */}
      <details className="group">
        <summary className="text-[10px] text-[#58a6ff] cursor-pointer hover:underline">
          View all assets
        </summary>
        <div className="mt-2 space-y-1">
          {sorted.map((a) => {
            if (!a.backtest) return null;
            return (
              <div key={a.symbol} className="flex items-center gap-2 text-[10px]">
                <span className="font-mono text-[#e6edf3] w-12 font-semibold">
                  {a.symbol.replace('-USD', '')}
                </span>
                <span className={`font-mono font-semibold ${a.backtest.totalReturn >= 0 ? 'text-[#3fb950]' : 'text-[#f85149]'}`}>
                  {a.backtest.totalReturn >= 0 ? '+' : ''}{a.backtest.totalReturn}%
                </span>
                <span className="text-[#8b949e] ml-auto">
                  {a.backtest.winRate}% / {a.backtest.tradeCount}t
                </span>
              </div>
            );
          })}
        </div>
      </details>

      <div className="flex items-start gap-1.5 pt-2 border-t border-[#30363d]">
        <AlertTriangle size={10} className="text-[#d29922] mt-0.5 shrink-0" />
        <p className="text-[9px] text-[#8b949e] leading-relaxed">
          Past performance does not guarantee future results. Backtest uses 90 days of daily data with ATR-based SL/TP.
        </p>
      </div>
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-[#0d1117] rounded-lg px-2.5 py-2 text-center">
      <p className={`text-sm font-mono font-bold ${color}`}>{value}</p>
      <p className="text-[9px] text-[#8b949e] mt-0.5">{label}</p>
    </div>
  );
}
