'use client';

import { Clock, Lock } from 'lucide-react';
import { TIMEFRAME_PRESETS, type TimeframeId } from '@/lib/timeframes';

const TIMEFRAMES: { id: TimeframeId; name: string; label: string }[] = [
  { id: 'short', name: 'Short', label: '1–5d' },
  { id: 'medium', name: 'Medium', label: '1–4w' },
  { id: 'long', name: 'Long', label: '1–3m' },
];

interface Props {
  value: TimeframeId;
  onChange: (id: TimeframeId) => void;
  allowedTimeframes?: TimeframeId[];
}

export default function TimeframeSelector({ value, onChange, allowedTimeframes }: Props) {
  const allowed = allowedTimeframes ?? (['short', 'medium', 'long'] as TimeframeId[]);
  const current = TIMEFRAME_PRESETS[value];

  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Clock size={16} className="text-[#58a6ff]" />
        <h2 className="text-sm font-semibold text-[#e6edf3]">Holding Period</h2>
      </div>

      {/* Pills */}
      <div className="flex gap-1.5">
        {TIMEFRAMES.map((tf) => {
          const active = value === tf.id;
          const locked = !allowed.includes(tf.id);
          return (
            <button
              key={tf.id}
              onClick={() => !locked && onChange(tf.id)}
              disabled={locked}
              className={`flex-1 py-2 rounded-lg text-center transition-all ${
                locked
                  ? 'opacity-30 cursor-not-allowed border border-[#30363d]'
                  : active
                    ? 'bg-[#58a6ff]/10 border border-[#58a6ff]/40 text-[#e6edf3]'
                    : 'border border-[#30363d] text-[#8b949e] hover:border-[#58a6ff]/20 hover:text-[#e6edf3]'
              }`}
            >
              <div className="text-xs font-semibold flex items-center justify-center gap-1">
                {tf.name}
                {locked && <Lock size={10} className="text-[#d29922]" />}
              </div>
              <div className="text-[10px] opacity-60 mt-0.5">{tf.label}</div>
            </button>
          );
        })}
      </div>

      {/* Description */}
      <p className="text-[10px] text-[#8b949e] leading-relaxed">
        {current.description}
      </p>

      {/* Parameter preview */}
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[9px] text-[#8b949e] font-mono">
        <span>RSI({current.rsiPeriod})</span>
        <span>MACD({current.macdFast}/{current.macdSlow}/{current.macdSignal})</span>
        <span>BB({current.bbPeriod})</span>
        <span>MA({current.maCrossFast}/{current.maCrossSlow})</span>
        <span>SL {current.slMultiplier}x</span>
        <span>TP {current.tpMultiplier}x</span>
      </div>
    </div>
  );
}
