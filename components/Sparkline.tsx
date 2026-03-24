'use client';

interface SparklineProps {
  data: number[];
  positive: boolean;
  width?: number;
  height?: number;
}

export default function Sparkline({ data, positive, width = 120, height = 36 }: SparklineProps) {
  if (data.length < 2) {
    return <div style={{ width, height }} className="opacity-20 bg-[#30363d] rounded" />;
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pad = 2;

  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (width - pad * 2);
    const y = height - pad - ((v - min) / range) * (height - pad * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const color = positive ? '#3fb950' : '#f85149';
  const fillId = `fill-${positive ? 'pos' : 'neg'}`;

  // Build the fill path (close the area below the line)
  const firstX = pad;
  const lastX = width - pad;
  const bottomY = height - pad;
  const areaPath = `M ${pts[0]} L ${pts.join(' L ')} L ${lastX},${bottomY} L ${firstX},${bottomY} Z`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden>
      <defs>
        <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${fillId})`} />
      <polyline
        points={pts.join(' ')}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
