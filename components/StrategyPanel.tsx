'use client';

import { BarChart2, Layers, Activity, TrendingUp, Zap } from 'lucide-react';
import { COMBO_PRESETS } from '@/lib/strategies';

interface Strategy {
  id: string;
  name: string;
  description: string;
  available: boolean;
  icon: React.ReactNode;
}

const STRATEGIES: Strategy[] = [
  {
    id: 'rsi',
    name: 'RSI',
    description: 'Relative Strength Index — buy < 30, sell > 70',
    available: true,
    icon: <Activity size={14} />,
  },
  {
    id: 'macd',
    name: 'MACD',
    description: 'Moving Average Convergence/Divergence crossovers',
    available: true,
    icon: <TrendingUp size={14} />,
  },
  {
    id: 'bb',
    name: 'Bollinger Bands',
    description: 'Price deviation from moving average bands',
    available: true,
    icon: <BarChart2 size={14} />,
  },
  {
    id: 'ma_cross',
    name: 'MA Crossover',
    description: '20/50 EMA golden & death cross signals',
    available: true,
    icon: <Layers size={14} />,
  },
];

interface Props {
  enabledStrategies: string[];
  onChange: (ids: string[]) => void;
  allowedStrategies?: string[];
  showCombos?: boolean;
}

export default function StrategyPanel({ enabledStrategies, onChange, allowedStrategies, showCombos = true }: Props) {
  const allowed = allowedStrategies ?? STRATEGIES.map((s) => s.id);

  function toggle(id: string) {
    if (!allowed.includes(id)) return;
    if (enabledStrategies.includes(id)) {
      if (enabledStrategies.length <= 1) return;
      onChange(enabledStrategies.filter((s) => s !== id));
    } else {
      onChange([...enabledStrategies, id]);
    }
  }

  function applyCombo(strategies: string[]) {
    onChange(strategies);
  }

  const activeCombo = COMBO_PRESETS.find(
    (c) =>
      c.strategies.length === enabledStrategies.length &&
      c.strategies.every((s) => enabledStrategies.includes(s)),
  );

  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Activity size={16} className="text-[#58a6ff]" />
        <h2 className="text-sm font-semibold text-[#e6edf3]">Strategies</h2>
        {enabledStrategies.length > 1 && (
          <span className="text-[9px] bg-[#58a6ff]/10 text-[#58a6ff] px-1.5 py-0.5 rounded-full ml-auto font-semibold">
            {enabledStrategies.length} active
          </span>
        )}
      </div>

      {/* Individual strategies */}
      <div className="space-y-2">
        {STRATEGIES.map((s) => {
          const active = enabledStrategies.includes(s.id);
          const locked = !allowed.includes(s.id);
          return (
            <button
              key={s.id}
              onClick={() => toggle(s.id)}
              disabled={locked}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-all ${
                locked
                  ? 'opacity-40 cursor-not-allowed border-[#30363d]'
                  : active
                    ? 'bg-[#58a6ff]/10 border-[#58a6ff]/40 text-[#e6edf3]'
                    : 'border-[#30363d] text-[#8b949e] hover:border-[#58a6ff]/20 hover:text-[#e6edf3]'
              }`}
            >
              <span className={active && !locked ? 'text-[#58a6ff]' : ''}>{s.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold">{s.name}</span>
                  {locked && (
                    <span className="text-[9px] bg-[#d29922]/10 text-[#d29922] px-1.5 py-0.5 rounded uppercase tracking-widest">
                      Pro
                    </span>
                  )}
                </div>
                <p className="text-[10px] mt-0.5 opacity-70">{s.description}</p>
              </div>
              <div
                className={`w-8 h-4 rounded-full transition-colors relative ${active && !locked ? 'bg-[#58a6ff]' : 'bg-[#30363d]'}`}
              >
                <div
                  className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${active && !locked ? 'translate-x-4' : 'translate-x-0.5'}`}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Combo presets */}
      {showCombos && <div className="pt-2 border-t border-[#30363d] space-y-2">
        <div className="flex items-center gap-2">
          <Zap size={12} className="text-[#d29922]" />
          <span className="text-[10px] font-semibold text-[#8b949e] uppercase tracking-widest">
            Combos
          </span>
        </div>
        <div className="space-y-1.5">
          {COMBO_PRESETS.map((combo) => {
            const isActive = activeCombo?.id === combo.id;
            return (
              <button
                key={combo.id}
                onClick={() => applyCombo(combo.strategies)}
                className={`w-full text-left px-3 py-2 rounded-lg border transition-all ${
                  isActive
                    ? 'bg-[#d29922]/10 border-[#d29922]/40 text-[#e6edf3]'
                    : 'border-[#30363d]/50 text-[#8b949e] hover:border-[#d29922]/20 hover:text-[#e6edf3]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold">{combo.name}</span>
                  <span className="text-[9px] opacity-60">
                    {combo.strategies.length} strategies
                  </span>
                  {isActive && (
                    <span className="text-[8px] bg-[#d29922]/20 text-[#d29922] px-1.5 py-0.5 rounded-full ml-auto font-bold uppercase">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-[10px] mt-0.5 opacity-60">{combo.description}</p>
              </button>
            );
          })}
        </div>
      </div>}

      {/* Multi-strategy info */}
      {enabledStrategies.length > 1 && (
        <div className="pt-2 border-t border-[#30363d]">
          <p className="text-[10px] text-[#8b949e] leading-relaxed">
            <span className="text-[#58a6ff] font-semibold">Consensus mode:</span>{' '}
            {enabledStrategies.length === 2
              ? 'Both strategies must agree for BUY/SELL signals.'
              : 'Majority must agree with no opposing signals.'}
          </p>
        </div>
      )}
    </div>
  );
}
