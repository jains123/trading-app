import Link from 'next/link';
import type { Metadata } from 'next';
import { Activity, TrendingUp, BarChart2, Layers, Zap, ArrowLeft, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Trading Strategies Explained — Trading Signals',
  description:
    'An in-depth guide to RSI, MACD, Bollinger Bands, MA Crossover, and the best strategy combinations for maximising trading profits.',
};

export default function StrategiesPage() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3]">
      {/* Nav */}
      <nav className="border-b border-[#30363d]/50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-[#58a6ff] text-lg">◈</span>
            <span className="font-bold text-sm">Trading Signals</span>
          </Link>
          <Link
            href="/signup"
            className="text-xs px-4 py-2 bg-[#58a6ff] text-[#0d1117] font-semibold rounded-lg hover:bg-[#79b8ff] transition-colors"
          >
            Start free trial
          </Link>
        </div>
      </nav>

      <article className="max-w-3xl mx-auto px-4 py-12">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-[#8b949e] hover:text-[#58a6ff] transition-colors mb-8"
        >
          <ArrowLeft size={14} />
          Back to home
        </Link>

        {/* Header */}
        <header className="mb-12">
          <p className="text-xs text-[#58a6ff] font-semibold uppercase tracking-widest mb-3">
            Strategy Guide
          </p>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
            Understanding Trading Strategies: A Complete Guide
          </h1>
          <p className="text-lg text-[#8b949e] leading-relaxed">
            Technical indicators are mathematical calculations based on price and volume data.
            Used alone, each tells you something different about a stock or crypto.
            Used together, they can dramatically improve your trading accuracy.
            Here&apos;s how each one works and — more importantly — how to combine them.
          </p>
        </header>

        <div className="h-px bg-[#30363d] mb-12" />

        {/* ---- RSI ---- */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#58a6ff]/10 rounded-lg flex items-center justify-center">
              <Activity size={20} className="text-[#58a6ff]" />
            </div>
            <h2 className="text-2xl font-bold">Relative Strength Index (RSI)</h2>
          </div>

          <p className="text-[#8b949e] leading-relaxed mb-4">
            The RSI is a <strong className="text-[#e6edf3]">momentum oscillator</strong> that
            measures the speed and magnitude of recent price changes on a scale from 0 to 100.
            Developed by J. Welles Wilder in 1978, it remains one of the most widely used
            indicators in technical analysis.
          </p>

          <h3 className="text-lg font-semibold mb-2">How it works</h3>
          <p className="text-[#8b949e] leading-relaxed mb-4">
            RSI compares the average gains to average losses over a lookback period (typically 14 days).
            When an asset has been rising consistently, the RSI pushes towards 100.
            When it&apos;s been falling, it drops towards 0. The calculation uses Wilder&apos;s
            smoothing method, which gives more weight to recent data while maintaining a long memory.
          </p>

          <h3 className="text-lg font-semibold mb-2">Reading the signals</h3>
          <ul className="space-y-2 text-[#8b949e] mb-4">
            <li className="flex gap-2">
              <span className="text-[#3fb950] font-semibold shrink-0">RSI &le; 30:</span>
              <span><strong className="text-[#e6edf3]">Oversold</strong> — the asset may be undervalued. Buyers often step in at these levels, making it a potential buy signal.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-[#f85149] font-semibold shrink-0">RSI &ge; 70:</span>
              <span><strong className="text-[#e6edf3]">Overbought</strong> — the asset may be overvalued. Profit-taking is common here, making it a potential sell signal.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-[#d29922] font-semibold shrink-0">30–70:</span>
              <span><strong className="text-[#e6edf3]">Neutral</strong> — no strong signal. The asset is trading within a normal range.</span>
            </li>
          </ul>

          <h3 className="text-lg font-semibold mb-2">Strengths and weaknesses</h3>
          <p className="text-[#8b949e] leading-relaxed mb-4">
            RSI excels at catching <strong className="text-[#e6edf3]">mean-reversion opportunities</strong> —
            moments when price has moved too far, too fast. It works best in ranging markets.
            In strong trends, however, RSI can stay overbought or oversold for extended periods,
            generating false signals. This is why combining RSI with a trend-following indicator
            like MACD is so effective.
          </p>

          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4">
            <p className="text-xs text-[#8b949e]">
              <span className="text-[#58a6ff] font-semibold">Our implementation:</span>{' '}
              We use Wilder&apos;s Smoothed RSI with configurable periods — RSI(7) for short-term trades,
              RSI(14) for medium-term (industry standard), and RSI(21) for position trades.
              Thresholds tighten or widen with the timeframe.
            </p>
          </div>
        </section>

        {/* ---- MACD ---- */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#58a6ff]/10 rounded-lg flex items-center justify-center">
              <TrendingUp size={20} className="text-[#58a6ff]" />
            </div>
            <h2 className="text-2xl font-bold">MACD — Moving Average Convergence/Divergence</h2>
          </div>

          <p className="text-[#8b949e] leading-relaxed mb-4">
            Created by Gerald Appel in the late 1970s, MACD is a{' '}
            <strong className="text-[#e6edf3]">trend-following momentum indicator</strong> that
            shows the relationship between two moving averages of an asset&apos;s price.
            While RSI tells you if something is oversold, MACD tells you if the
            momentum is actually shifting.
          </p>

          <h3 className="text-lg font-semibold mb-2">The three components</h3>
          <ul className="space-y-2 text-[#8b949e] mb-4">
            <li>
              <strong className="text-[#e6edf3]">MACD Line</strong> = Fast EMA (12) minus Slow EMA (26).
              When the fast average is above the slow average, momentum is bullish.
            </li>
            <li>
              <strong className="text-[#e6edf3]">Signal Line</strong> = 9-period EMA of the MACD Line.
              This smooths out the MACD and provides crossover signals.
            </li>
            <li>
              <strong className="text-[#e6edf3]">Histogram</strong> = MACD Line minus Signal Line.
              Positive histogram = bullish momentum; negative = bearish.
            </li>
          </ul>

          <h3 className="text-lg font-semibold mb-2">Reading the signals</h3>
          <p className="text-[#8b949e] leading-relaxed mb-4">
            The key signal is the <strong className="text-[#e6edf3]">crossover</strong>.
            When the MACD line crosses above the signal line (the histogram turns positive),
            that&apos;s a bullish signal. When it crosses below (histogram turns negative),
            that&apos;s bearish. The further the MACD is from zero, the stronger the trend.
          </p>

          <h3 className="text-lg font-semibold mb-2">Why traders love MACD</h3>
          <p className="text-[#8b949e] leading-relaxed mb-4">
            MACD combines trend and momentum into a single indicator. It confirms direction
            changes rather than just measuring extremes. This makes it an excellent
            companion to RSI — where RSI says &ldquo;this is oversold,&rdquo; MACD says
            &ldquo;and the momentum is actually turning bullish now.&rdquo;
          </p>

          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4">
            <p className="text-xs text-[#8b949e]">
              <span className="text-[#58a6ff] font-semibold">Our implementation:</span>{' '}
              Standard MACD(12/26/9) for medium-term, fast MACD(6/13/5) for short-term swing trades,
              and slow MACD(19/39/9) for position trades. Signals fire on histogram zero-line crossovers.
            </p>
          </div>
        </section>

        {/* ---- Bollinger Bands ---- */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#58a6ff]/10 rounded-lg flex items-center justify-center">
              <BarChart2 size={20} className="text-[#58a6ff]" />
            </div>
            <h2 className="text-2xl font-bold">Bollinger Bands</h2>
          </div>

          <p className="text-[#8b949e] leading-relaxed mb-4">
            Developed by John Bollinger in the 1980s, Bollinger Bands are a{' '}
            <strong className="text-[#e6edf3]">volatility indicator</strong> that creates a
            price envelope around a moving average. The bands expand when volatility increases
            and contract when it decreases.
          </p>

          <h3 className="text-lg font-semibold mb-2">The three lines</h3>
          <ul className="space-y-2 text-[#8b949e] mb-4">
            <li>
              <strong className="text-[#e6edf3]">Middle Band</strong> = 20-period Simple Moving Average (SMA).
              This is the baseline — the &ldquo;average&rdquo; price.
            </li>
            <li>
              <strong className="text-[#e6edf3]">Upper Band</strong> = Middle + 2 standard deviations.
              Statistically, price should stay below this 95% of the time.
            </li>
            <li>
              <strong className="text-[#e6edf3]">Lower Band</strong> = Middle - 2 standard deviations.
              Price below this is statistically extreme.
            </li>
          </ul>

          <h3 className="text-lg font-semibold mb-2">The %B indicator</h3>
          <p className="text-[#8b949e] leading-relaxed mb-4">
            We use <strong className="text-[#e6edf3]">%B</strong>, which tells you where the price
            sits relative to the bands. A %B of 0 means price is at the lower band (potential buy).
            A %B of 1 means price is at the upper band (potential sell). Values below 0 or above 1
            indicate a breakout beyond the bands — these are the strongest signals.
          </p>

          <h3 className="text-lg font-semibold mb-2">Why Bollinger Bands matter</h3>
          <p className="text-[#8b949e] leading-relaxed mb-4">
            Unlike RSI, which measures momentum, Bollinger Bands measure{' '}
            <strong className="text-[#e6edf3]">price deviation from the norm</strong>.
            A stock can have a neutral RSI but still be at the bottom of its Bollinger Band —
            that&apos;s a signal RSI would miss. The bands also adapt to volatility: in calm markets
            they tighten (smaller range to breach), in volatile markets they widen (larger moves
            needed to trigger signals).
          </p>

          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4">
            <p className="text-xs text-[#8b949e]">
              <span className="text-[#58a6ff] font-semibold">Our implementation:</span>{' '}
              BB(10, 1.5σ) for short-term, BB(20, 2σ) for medium-term (standard),
              and BB(30, 2.5σ) for long-term position trades. Signals trigger when %B
              drops below 0 (buy) or rises above 1 (sell).
            </p>
          </div>
        </section>

        {/* ---- MA Crossover ---- */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#58a6ff]/10 rounded-lg flex items-center justify-center">
              <Layers size={20} className="text-[#58a6ff]" />
            </div>
            <h2 className="text-2xl font-bold">Moving Average Crossover</h2>
          </div>

          <p className="text-[#8b949e] leading-relaxed mb-4">
            The moving average crossover is one of the oldest and most reliable{' '}
            <strong className="text-[#e6edf3]">trend-following strategies</strong> in trading.
            It compares a fast-moving average (which reacts quickly to price changes) with
            a slow-moving average (which represents the longer-term trend).
          </p>

          <h3 className="text-lg font-semibold mb-2">Golden Cross and Death Cross</h3>
          <ul className="space-y-2 text-[#8b949e] mb-4">
            <li className="flex gap-2">
              <span className="text-[#3fb950] font-semibold shrink-0">Golden Cross:</span>
              <span>The fast EMA crosses above the slow EMA. This signals that short-term momentum is turning bullish and the trend may be shifting upward. Historically, golden crosses have preceded significant rallies.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-[#f85149] font-semibold shrink-0">Death Cross:</span>
              <span>The fast EMA crosses below the slow EMA. This signals weakening momentum and a potential downtrend. The name is dramatic, but the signal is well-documented.</span>
            </li>
          </ul>

          <h3 className="text-lg font-semibold mb-2">Why use EMA over SMA?</h3>
          <p className="text-[#8b949e] leading-relaxed mb-4">
            We use <strong className="text-[#e6edf3]">Exponential Moving Averages (EMA)</strong> rather
            than Simple Moving Averages because EMAs give more weight to recent prices. This makes
            them more responsive to current market conditions while still smoothing out noise.
            The crossover signal arrives earlier with EMAs, which matters when you&apos;re trying
            to catch a trend shift.
          </p>

          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4">
            <p className="text-xs text-[#8b949e]">
              <span className="text-[#58a6ff] font-semibold">Our implementation:</span>{' '}
              EMA(9/21) for short-term, EMA(20/50) for medium-term, and EMA(30/60) for
              long-term position trades. Signals fire on the crossover event itself.
            </p>
          </div>
        </section>

        <div className="h-px bg-[#30363d] mb-12" />

        {/* ---- COMBOS ---- */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#d29922]/10 rounded-lg flex items-center justify-center">
              <Zap size={20} className="text-[#d29922]" />
            </div>
            <h2 className="text-2xl font-bold">Strategy Combinations</h2>
          </div>

          <p className="text-[#8b949e] leading-relaxed mb-6">
            No single indicator is perfect. Each one captures a different dimension of market
            behaviour — momentum, trend, volatility, mean-reversion. By requiring multiple
            indicators to agree before acting, you filter out false signals and trade only
            when the evidence is strongest. Here are the five combinations we&apos;ve built
            and why they work.
          </p>

          {/* Momentum Reversal */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 mb-4">
            <h3 className="text-lg font-semibold mb-1">
              Momentum Reversal{' '}
              <span className="text-xs text-[#8b949e] font-normal">(RSI + MACD)</span>
            </h3>
            <p className="text-sm text-[#8b949e] leading-relaxed mb-3">
              The most popular retail combination. RSI identifies when an asset is at an
              extreme (oversold or overbought), and MACD confirms that momentum is
              actually reversing — not just pausing. This eliminates the classic RSI trap
              where price continues falling after hitting oversold.
            </p>
            <p className="text-sm text-[#8b949e] leading-relaxed">
              <strong className="text-[#e6edf3]">Best for:</strong> All-round trading.
              Works well on both stocks and crypto. Historically reduces false positives
              by approximately 40% compared to either indicator alone.
            </p>
          </div>

          {/* Mean Reversion */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 mb-4">
            <h3 className="text-lg font-semibold mb-1">
              Mean Reversion{' '}
              <span className="text-xs text-[#8b949e] font-normal">(RSI + Bollinger Bands)</span>
            </h3>
            <p className="text-sm text-[#8b949e] leading-relaxed mb-3">
              Both indicators measure mean-reversion from different angles. RSI measures
              momentum exhaustion, while Bollinger Bands measure statistical price deviation.
              When both agree — RSI is oversold AND price is below the lower band — the
              probability of a bounce is significantly higher than with either alone.
            </p>
            <p className="text-sm text-[#8b949e] leading-relaxed">
              <strong className="text-[#e6edf3]">Best for:</strong> Volatile assets, especially
              crypto. The double mean-reversion filter catches the best dip-buying opportunities
              while avoiding assets that are falling for fundamental reasons.
            </p>
          </div>

          {/* Trend Confirmation */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 mb-4">
            <h3 className="text-lg font-semibold mb-1">
              Trend Confirmation{' '}
              <span className="text-xs text-[#8b949e] font-normal">(MACD + MA Crossover)</span>
            </h3>
            <p className="text-sm text-[#8b949e] leading-relaxed mb-3">
              Two trend-following indicators operating on different timeframes. MACD (12/26)
              catches shorter momentum shifts, while the MA Crossover (20/50 EMA) confirms the
              broader trend direction. When both agree, you&apos;re trading in the direction of
              both short-term and medium-term trends.
            </p>
            <p className="text-sm text-[#8b949e] leading-relaxed">
              <strong className="text-[#e6edf3]">Best for:</strong> Reducing whipsaw in
              ranging or choppy markets. If MACD gives a buy signal but the MAs haven&apos;t
              crossed, the trend isn&apos;t confirmed — you wait.
            </p>
          </div>

          {/* Triple Confirmation */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 mb-4">
            <h3 className="text-lg font-semibold mb-1">
              Triple Confirmation{' '}
              <span className="text-xs text-[#8b949e] font-normal">(RSI + MACD + Bollinger Bands)</span>
            </h3>
            <p className="text-sm text-[#8b949e] leading-relaxed mb-3">
              Three independent indicators covering momentum, trend, and volatility.
              A signal only fires when at least two agree and none oppose. This generates
              far fewer signals, but each one carries much higher conviction. Think of it
              as quality over quantity.
            </p>
            <p className="text-sm text-[#8b949e] leading-relaxed">
              <strong className="text-[#e6edf3]">Best for:</strong> Conservative traders who
              want high-conviction entries. If you can only check your portfolio once a day and
              need to trust the signal, this is your combo.
            </p>
          </div>

          {/* Full Confluence */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 mb-4">
            <h3 className="text-lg font-semibold mb-1">
              Full Confluence{' '}
              <span className="text-xs text-[#8b949e] font-normal">(All 4 strategies)</span>
            </h3>
            <p className="text-sm text-[#8b949e] leading-relaxed mb-3">
              Maximum confirmation. All four indicators must agree — momentum is at an
              extreme (RSI), the trend is shifting (MACD), price has deviated from its
              average (BB), and the moving averages have crossed (MA). When everything
              aligns, you&apos;re looking at the highest-probability setup possible with
              these tools.
            </p>
            <p className="text-sm text-[#8b949e] leading-relaxed">
              <strong className="text-[#e6edf3]">Best for:</strong> Extremely selective
              swing trading. You may go weeks without a signal, but when one fires, the
              odds are strongly in your favour. Pair this with ATR-based stop-losses
              for defined risk.
            </p>
          </div>
        </section>

        <div className="h-px bg-[#30363d] mb-12" />

        {/* ---- Consensus model ---- */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-4">How Our Consensus Model Works</h2>
          <p className="text-[#8b949e] leading-relaxed mb-4">
            When you enable multiple strategies, we don&apos;t just average them.
            We use a <strong className="text-[#e6edf3]">strict consensus model</strong>:
          </p>
          <ul className="space-y-3 text-[#8b949e] mb-4">
            <li>
              <strong className="text-[#e6edf3]">2 strategies:</strong> Both must agree for a
              BUY or SELL signal. If one says BUY and the other says HOLD, the combined
              signal is HOLD. No compromise.
            </li>
            <li>
              <strong className="text-[#e6edf3]">3+ strategies:</strong> A majority must agree,
              AND there can be no opposing signals. So with 3 strategies, 2 BUYs and 1 HOLD = BUY.
              But 2 BUYs and 1 SELL = HOLD. One dissenter vetoes the signal.
            </li>
          </ul>
          <p className="text-[#8b949e] leading-relaxed">
            This is deliberately conservative. Missed opportunities are free; bad trades cost money.
            The consensus model is designed to keep you out of bad trades, not to get you into
            every good one.
          </p>
        </section>

        {/* CTA */}
        <section className="bg-[#161b22] border border-[#30363d] rounded-2xl p-8 text-center">
          <h2 className="text-xl font-bold mb-3">Try these strategies yourself</h2>
          <p className="text-sm text-[#8b949e] mb-6 max-w-lg mx-auto">
            Every strategy and combination is available during your 14-day Pro trial.
            See real signals on real assets — no credit card required.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-3 bg-[#58a6ff] text-[#0d1117] font-semibold rounded-lg hover:bg-[#79b8ff] transition-colors text-sm"
          >
            Start free trial
            <ArrowRight size={16} />
          </Link>
        </section>
      </article>

      {/* Footer */}
      <footer className="border-t border-[#30363d]/50 py-8 px-4 mt-12">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#8b949e]">
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
