'use client';

interface RsiMeterProps {
  rsi: number | null;
  buyThreshold?: number;
  sellThreshold?: number;
}

export default function RsiMeter({ rsi, buyThreshold = 30, sellThreshold = 70 }: RsiMeterProps) {
  if (rsi === null) {
    return (
      <div className="space-y-1">
        <div className="flex justify-between text-[10px] text-[#8b949e]">
          <span>RSI</span>
          <span>—</span>
        </div>
        <div className="h-1.5 bg-[#30363d] rounded-full overflow-hidden">
          <div className="h-full w-0 bg-[#8b949e] rounded-full" />
        </div>
      </div>
    );
  }

  const pct = Math.min(100, Math.max(0, rsi));
  const color =
    rsi <= buyThreshold ? '#3fb950' : rsi >= sellThreshold ? '#f85149' : '#d29922';

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px]">
        <span className="text-[#8b949e]">RSI (14)</span>
        <span style={{ color }} className="font-mono font-semibold">
          {rsi.toFixed(1)}
        </span>
      </div>
      <div className="relative h-1.5 bg-[#30363d] rounded-full overflow-hidden">
        {/* threshold zones */}
        <div
          className="absolute top-0 left-0 h-full opacity-20 bg-[#3fb950]"
          style={{ width: `${buyThreshold}%` }}
        />
        <div
          className="absolute top-0 right-0 h-full opacity-20 bg-[#f85149]"
          style={{ width: `${100 - sellThreshold}%` }}
        />
        {/* indicator */}
        <div
          className="absolute top-0 h-full w-1 -translate-x-1/2 rounded-full transition-all duration-500"
          style={{ left: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <div className="flex justify-between text-[9px] text-[#8b949e]">
        <span>0</span>
        <span className="text-[#3fb950]/70">{buyThreshold}</span>
        <span className="text-[#f85149]/70">{sellThreshold}</span>
        <span>100</span>
      </div>
    </div>
  );
}
