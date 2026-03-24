'use client';

import { BarChart2, Layers, Activity, TrendingUp } from 'lucide-react';

interface Strategy {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  available: boolean;
  icon: React.ReactNode;
}

const STRATEGIES: Omit<Strategy, 'enabled'>[] = [
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
    available: false,
    icon: <TrendingUp size={14} />,
  },
  {
    id: 'bb',
    name: 'Bollinger Bands',
    description: 'Price deviation from moving average bands',
    available: false,
    icon: <BarChart2 size={14} />,
  },
  {
    id: 'ma_cross',
    name: 'MA Crossover',
    description: '50/200 EMA golden & death cross signals',
    available: false,
    icon: <Layers size={14} />,
  },
];

interface Props {
  enabledStrategies: string[];
  onChange: (ids: string[]) => void;
}

export default function StrategyPanel({ enabledStrategies, onChange }: Props) {
  function toggle(id: string, available: boolean) {
    if (!available) return;
    if (enabledStrategies.includes(id)) {
      onChange(enabledStrategies.filter((s) => s !== id));
    } else {
      onChange([...enabledStrategies, id]);
    }
  }

  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Activity size={16} className="text-[#58a6ff]" />
        <h2 className="text-sm font-semibold text-[#e6edf3]">Strategies</h2>
      </div>

      <div className="space-y-2">
        {STRATEGIES.map((s) => {
          const active = enabledStrategies.includes(s.id);
          return (
            <button
              key={s.id}
              onClick={() => toggle(s.id, s.available)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-all ${
                !s.available
                  ? 'opacity-40 cursor-not-allowed border-[#30363d]'
                  : active
                    ? 'bg-[#58a6ff]/10 border-[#58a6ff]/40 text-[#e6edf3]'
                    : 'border-[#30363d] text-[#8b949e] hover:border-[#58a6ff]/20 hover:text-[#e6edf3]'
              }`}
            >
              <span className={active ? 'text-[#58a6ff]' : ''}>{s.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold">{s.name}</span>
                  {!s.available && (
                    <span className="text-[9px] bg-[#8b949e]/10 text-[#8b949e] px-1.5 py-0.5 rounded uppercase tracking-widest">
                      Soon
                    </span>
                  )}
                </div>
                <p className="text-[10px] mt-0.5 opacity-70">{s.description}</p>
              </div>
              <div
                className={`w-8 h-4 rounded-full transition-colors relative ${active && s.available ? 'bg-[#58a6ff]' : 'bg-[#30363d]'}`}
              >
                <div
                  className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${active && s.available ? 'translate-x-4' : 'translate-x-0.5'}`}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
