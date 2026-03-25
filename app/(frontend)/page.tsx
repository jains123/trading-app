import Link from 'next/link';
import type { Metadata } from 'next';
import {
  Activity,
  BarChart2,
  Shield,
  TrendingUp,
  Bell,
  Zap,
  ArrowRight,
  type LucideIcon,
} from 'lucide-react';
import RenderBlock from '@/components/blocks/RenderBlock';

export const dynamic = 'force-dynamic';

const ICON_MAP: Record<string, LucideIcon> = {
  Activity,
  BarChart2,
  Shield,
  TrendingUp,
  Bell,
  Zap,
};

/* ---------- Default content (used before CMS is populated) ---------- */

const DEFAULTS = {
  hero: {
    headline: 'Real-Time Trading Signals',
    subheadline:
      'Multi-strategy analysis with RSI, MACD, Bollinger Bands and MA Crossover. Backtested signals with built-in risk management.',
    ctaText: 'Open Dashboard',
    ctaLink: '/dashboard',
  },
  features: [
    {
      icon: 'Activity',
      title: '4 Technical Strategies',
      description:
        'RSI, MACD, Bollinger Bands and MA Crossover — use them individually or combine for higher-conviction signals.',
    },
    {
      icon: 'BarChart2',
      title: '90-Day Backtesting',
      description:
        'Every strategy combo is backtested against historical data. See win rates, drawdowns and profit factors before you trade.',
    },
    {
      icon: 'Shield',
      title: 'Built-in Risk Management',
      description:
        'ATR-based stop-loss and take-profit levels on every signal. Know your risk:reward before entering.',
    },
    {
      icon: 'TrendingUp',
      title: 'Support & Resistance',
      description:
        'Auto-detected price levels from pivot points. See key zones where reversals are most likely.',
    },
    {
      icon: 'Bell',
      title: 'Push Notifications',
      description:
        'Get instant alerts on your phone via ntfy.sh when signals change. Never miss a trade.',
    },
    {
      icon: 'Zap',
      title: 'Strategy Combos',
      description:
        'Pre-researched strategy combinations like Momentum Reversal and Mean Reversion. One-click activation.',
    },
  ],
  meta: {
    title: 'Trading Signals — Real-Time Technical Analysis',
    description:
      'Multi-strategy buy/sell signals for stocks and crypto with backtesting, risk management, and push notifications.',
  },
};

/* ---------- Payload data fetching ---------- */

async function getLandingData() {
  try {
    const { getPayload } = await import('payload');
    const config = (await import('@payload-config')).default;
    const payload = await getPayload({ config });
    const data = await payload.findGlobal({ slug: 'landing-page' });
    return data;
  } catch {
    // Payload not initialised yet or DB not seeded — use defaults
    return null;
  }
}

/* ---------- Metadata ---------- */

export async function generateMetadata(): Promise<Metadata> {
  const data = await getLandingData();
  return {
    title: data?.meta?.title || DEFAULTS.meta.title,
    description: data?.meta?.description || DEFAULTS.meta.description,
  };
}

/* ---------- Page ---------- */

export default async function LandingPage() {
  const data = await getLandingData();

  const hero = data?.hero ?? DEFAULTS.hero;
  const features = (data?.features as typeof DEFAULTS.features) ?? DEFAULTS.features;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const blocks = (data?.blocks as any[]) ?? [];

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3]">
      {/* Nav */}
      <nav className="border-b border-[#30363d]/50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[#58a6ff] text-lg">◈</span>
            <span className="font-bold text-sm">Trading Signals</span>
          </div>
          <Link
            href={hero.ctaLink ?? '/dashboard'}
            className="text-xs px-4 py-2 bg-[#21262d] border border-[#30363d] rounded-lg hover:bg-[#30363d] transition-colors"
          >
            {hero.ctaText ?? 'Open Dashboard'}
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-20 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#58a6ff]/10 border border-[#58a6ff]/20 rounded-full mb-8">
            <span className="w-2 h-2 bg-[#3fb950] rounded-full animate-pulse" />
            <span className="text-xs text-[#58a6ff]">Live signals updating every 60s</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
            {hero.headline}
          </h1>
          <p className="text-lg md:text-xl text-[#8b949e] mt-6 max-w-2xl mx-auto leading-relaxed">
            {hero.subheadline}
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={hero.ctaLink ?? '/dashboard'}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#58a6ff] text-[#0d1117] font-semibold rounded-lg hover:bg-[#79b8ff] transition-colors text-sm"
            >
              {hero.ctaText ?? 'Open Dashboard'}
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Asset ticker preview */}
      <section className="py-8 border-y border-[#30363d]/50">
        <div className="max-w-5xl mx-auto px-4 flex flex-wrap justify-center gap-6 text-xs text-[#8b949e]">
          {['AAPL', 'NVDA', 'TSLA', 'MSFT', 'GOOGL', 'BTC', 'ETH', 'SOL'].map((s) => (
            <span key={s} className="font-mono font-semibold text-[#e6edf3]/60">
              {s}
            </span>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
            Everything you need to trade smarter
          </h2>
          <p className="text-[#8b949e] text-center mb-12 max-w-2xl mx-auto">
            Combine multiple technical indicators, validate with backtesting, and manage risk — all in one dashboard.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => {
              const IconComponent = ICON_MAP[feature.icon ?? ''] ?? Activity;
              return (
                <div
                  key={i}
                  className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 hover:border-[#58a6ff]/30 transition-colors"
                >
                  <div className="w-10 h-10 bg-[#58a6ff]/10 rounded-lg flex items-center justify-center mb-4">
                    <IconComponent size={20} className="text-[#58a6ff]" />
                  </div>
                  <h3 className="font-semibold text-[#e6edf3] mb-2">{feature.title}</h3>
                  <p className="text-sm text-[#8b949e] leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Dynamic CMS blocks */}
      {blocks.map((block, i) => (
        <RenderBlock key={i} block={block} />
      ))}

      {/* Bottom CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold">Ready to start trading?</h2>
          <p className="text-[#8b949e] mt-4">
            No sign-up required. Open the dashboard and start analysing.
          </p>
          <Link
            href={hero.ctaLink ?? '/dashboard'}
            className="inline-flex items-center gap-2 mt-8 px-8 py-3.5 bg-[#58a6ff] text-[#0d1117] font-semibold rounded-lg hover:bg-[#79b8ff] transition-colors text-sm"
          >
            {hero.ctaText ?? 'Open Dashboard'}
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#30363d]/50 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#8b949e]">
          <div className="flex items-center gap-2">
            <span className="text-[#58a6ff]">◈</span>
            <span>Trading Signals</span>
          </div>
          <p>Data via Stooq &amp; CoinGecko. Not financial advice.</p>
        </div>
      </footer>
    </div>
  );
}
