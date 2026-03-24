'use client';

import type { SignalType } from '@/lib/types';

const CONFIG: Record<SignalType, { label: string; classes: string }> = {
  BUY: {
    label: 'BUY',
    classes: 'bg-[#3fb950]/15 text-[#3fb950] border border-[#3fb950]/30',
  },
  SELL: {
    label: 'SELL',
    classes: 'bg-[#f85149]/15 text-[#f85149] border border-[#f85149]/30',
  },
  HOLD: {
    label: 'HOLD',
    classes: 'bg-[#d29922]/15 text-[#d29922] border border-[#d29922]/30',
  },
  LOADING: {
    label: '···',
    classes: 'bg-[#8b949e]/10 text-[#8b949e] border border-[#30363d]',
  },
  ERROR: {
    label: 'ERR',
    classes: 'bg-[#f85149]/10 text-[#8b949e] border border-[#f85149]/20',
  },
};

export default function SignalBadge({
  signal,
  size = 'md',
}: {
  signal: SignalType;
  size?: 'sm' | 'md' | 'lg';
}) {
  const { label, classes } = CONFIG[signal] ?? CONFIG.LOADING;
  const sizeClass =
    size === 'sm'
      ? 'text-[10px] px-1.5 py-0.5'
      : size === 'lg'
        ? 'text-sm px-3 py-1'
        : 'text-xs px-2 py-0.5';

  return (
    <span className={`inline-flex items-center font-bold rounded tracking-widest ${sizeClass} ${classes}`}>
      {label}
    </span>
  );
}
