'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { RefreshCw, Wifi, WifiOff, Clock, SlidersHorizontal, X, LogOut, Lock, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { AssetData, NotificationSettings, SignalHistoryEntry, SignalType } from '@/lib/types';
import type { PlanFeatures, UserPlanStatus } from '@/lib/plans';
import AssetCard from './AssetCard';
import NotificationPanel from './NotificationPanel';
import StrategyPanel from './StrategyPanel';
import SignalBadge from './SignalBadge';
import BacktestPanel from './BacktestPanel';

const NOTIFY_TAGS: Record<string, string[]> = {
  BUY: ['green_circle', 'chart_with_upwards_trend', 'moneybag'],
  SELL: ['red_circle', 'chart_with_downwards_trend', 'money_with_wings'],
  HOLD: ['yellow_circle', 'pause_button'],
};

function formatPrice(price: number): string {
  if (price > 10000) return `$${price.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  if (price > 100) return `$${price.toFixed(2)}`;
  return `$${price.toFixed(4)}`;
}

function useLocalStorage<T>(key: string, defaultVal: T): [T, (v: T) => void] {
  const [val, setVal] = useState<T>(() => {
    if (typeof window === 'undefined') return defaultVal;
    try {
      const stored = localStorage.getItem(key);
      return stored ? (JSON.parse(stored) as T) : defaultVal;
    } catch {
      return defaultVal;
    }
  });

  function set(v: T) {
    setVal(v);
    try {
      localStorage.setItem(key, JSON.stringify(v));
    } catch {}
  }

  return [val, set];
}

/* ------------------------------------------------------------------ */
/*  Upgrade prompt — shown on locked features                         */
/* ------------------------------------------------------------------ */

function UpgradeOverlay({ label }: { label: string }) {
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-[#0d1117]/80 backdrop-blur-sm rounded-xl z-10 flex flex-col items-center justify-center gap-2 border border-[#d29922]/30">
        <Lock size={16} className="text-[#d29922]" />
        <p className="text-[10px] text-[#d29922] font-semibold text-center px-4">
          {label}
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Locked asset card placeholder                                      */
/* ------------------------------------------------------------------ */

function LockedAssetCard({ symbol, name, type }: { symbol: string; name: string; type: string }) {
  return (
    <div className="relative bg-[#161b22] border border-[#30363d] rounded-xl p-4 flex flex-col gap-3 opacity-50">
      <div className="absolute inset-0 bg-[#0d1117]/60 backdrop-blur-[2px] rounded-xl z-10 flex flex-col items-center justify-center gap-1.5">
        <Lock size={14} className="text-[#d29922]" />
        <span className="text-[9px] text-[#d29922] font-semibold">PRO</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-mono font-bold text-[#e6edf3] text-sm">{symbol.replace('-USD', '')}</span>
        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium uppercase tracking-wide ${
          type === 'crypto' ? 'bg-[#58a6ff]/10 text-[#58a6ff]' : 'bg-[#8b949e]/10 text-[#8b949e]'
        }`}>
          {type === 'crypto' ? 'CRYPTO' : 'STOCK'}
        </span>
      </div>
      <p className="text-[#8b949e] text-xs">{name}</p>
      <div className="h-12" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Dashboard                                                     */
/* ------------------------------------------------------------------ */

export default function Dashboard() {
  const [assets, setAssets] = useState<AssetData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);
  const [secondsAgo, setSecondsAgo] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [signalHistory, setSignalHistory] = useLocalStorage<SignalHistoryEntry[]>(
    'signal-history',
    [],
  );
  const [prevSignals, setPrevSignals] = useLocalStorage<Record<string, SignalType>>(
    'prev-signals',
    {},
  );
  const [notifSettings, setNotifSettings] = useLocalStorage<NotificationSettings>(
    'notif-settings',
    { ntfyTopic: '', enabled: true, buyThreshold: 30, sellThreshold: 70 },
  );
  const [enabledStrategies, setEnabledStrategies] = useLocalStorage<string[]>(
    'enabled-strategies',
    ['rsi'],
  );

  // Plan state
  const [planStatus, setPlanStatus] = useState<UserPlanStatus | null>(null);
  const features = planStatus?.features ?? null;
  const isPro = planStatus?.plan === 'pro';

  const [drawerOpen, setDrawerOpen] = useState(false);
  const router = useRouter();
  const abortRef = useRef<AbortController | null>(null);

  // Fetch user plan on mount
  useEffect(() => {
    fetch('/api/me', { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        if (data.plan && data.features) {
          setPlanStatus({ plan: data.plan, features: data.features, trial: data.trial });
        }
      })
      .catch(() => {});
  }, []);

  // If user is on free plan, restrict strategies to allowed ones
  useEffect(() => {
    if (!features) return;
    const allowed = features.strategies;
    const filtered = enabledStrategies.filter((s) => allowed.includes(s));
    if (filtered.length === 0) {
      setEnabledStrategies([allowed[0]]);
    } else if (filtered.length !== enabledStrategies.length) {
      setEnabledStrategies(filtered);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [features]);

  async function handleLogout() {
    await fetch('/api/users/logout', { method: 'POST', credentials: 'include' });
    router.push('/login');
    router.refresh();
  }

  const pollInterval = (features?.pollInterval ?? 60) * 1000;

  const fetchAssets = useCallback(
    async (manual = false) => {
      if (manual) setRefreshing(true);

      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;

      try {
        const params = new URLSearchParams({
          buyThreshold: String(notifSettings.buyThreshold),
          sellThreshold: String(notifSettings.sellThreshold),
          strategies: enabledStrategies.join(','),
        });
        const res = await fetch(`/api/assets?${params}`, { signal: ac.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const newAssets: AssetData[] = data.assets;

        setAssets(newAssets);
        setLastFetch(new Date());
        setSecondsAgo(0);
        setError(null);

        // Check for signal changes and notify
        if (notifSettings.enabled && notifSettings.ntfyTopic && (features?.notifications ?? false)) {
          const updatedPrev = { ...prevSignals };
          const newHistory: SignalHistoryEntry[] = [];

          for (const asset of newAssets) {
            if (asset.signal === 'LOADING' || asset.signal === 'ERROR') continue;
            const prev = prevSignals[asset.symbol];
            if (prev !== asset.signal && (asset.signal === 'BUY' || asset.signal === 'SELL')) {
              const emoji = asset.signal === 'BUY' ? '🟢' : '🔴';
              try {
                await fetch('/api/notify', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    topic: notifSettings.ntfyTopic,
                    title: `${emoji} ${asset.signal}: ${asset.name} (${asset.symbol.replace('-USD', '')})`,
                    message: `Price: ${formatPrice(asset.price)}  |  RSI: ${asset.rsi?.toFixed(1) ?? '—'}  |  Strategies: ${enabledStrategies.join(', ').toUpperCase()}\nMake your trade on T212`,
                    priority: 4,
                    tags: NOTIFY_TAGS[asset.signal] ?? [],
                  }),
                });
              } catch {}

              newHistory.push({
                symbol: asset.symbol,
                name: asset.name,
                signal: asset.signal,
                price: asset.price,
                rsi: asset.rsi,
                timestamp: new Date().toISOString(),
              });
            }
            updatedPrev[asset.symbol] = asset.signal;
          }

          setPrevSignals(updatedPrev);
          if (newHistory.length > 0) {
            setSignalHistory([...newHistory, ...signalHistory].slice(0, 50));
          }
        } else {
          const updatedPrev = { ...prevSignals };
          for (const asset of newAssets) {
            if (asset.signal !== 'LOADING' && asset.signal !== 'ERROR') {
              updatedPrev[asset.symbol] = asset.signal;
            }
          }
          setPrevSignals(updatedPrev);
        }
      } catch (e) {
        if (e instanceof Error && e.name === 'AbortError') return;
        setError('Failed to fetch data. Will retry.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [notifSettings.buyThreshold, notifSettings.sellThreshold, notifSettings.enabled, notifSettings.ntfyTopic, enabledStrategies],
  );

  // Initial fetch + polling
  useEffect(() => {
    fetchAssets();
    const interval = setInterval(() => fetchAssets(), pollInterval);
    return () => {
      clearInterval(interval);
      abortRef.current?.abort();
    };
  }, [fetchAssets, pollInterval]);

  // Seconds counter
  useEffect(() => {
    const t = setInterval(() => {
      if (lastFetch) {
        setSecondsAgo(Math.floor((Date.now() - lastFetch.getTime()) / 1000));
      }
    }, 1000);
    return () => clearInterval(t);
  }, [lastFetch]);

  // Filter assets based on plan
  const allowedSymbols = features?.allowedAssets ?? [];
  const isAllowed = (symbol: string) =>
    allowedSymbols.length === 0 || allowedSymbols.includes(symbol);

  const allStocks = assets.filter((a) => a.type === 'stock');
  const allCrypto = assets.filter((a) => a.type === 'crypto');
  const stocks = allStocks.filter((a) => isAllowed(a.symbol));
  const crypto = allCrypto.filter((a) => isAllowed(a.symbol));
  const lockedStocks = allStocks.filter((a) => !isAllowed(a.symbol));
  const lockedCrypto = allCrypto.filter((a) => !isAllowed(a.symbol));

  const buys = [...stocks, ...crypto].filter((a) => a.signal === 'BUY').length;
  const sells = [...stocks, ...crypto].filter((a) => a.signal === 'SELL').length;

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3]">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Trial banner */}
        {planStatus?.trial.active && (
          <div className="bg-[#d29922]/10 border border-[#d29922]/30 rounded-lg px-4 py-3 flex items-center gap-3">
            <Sparkles size={16} className="text-[#d29922] shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-[#e6edf3]">
                <span className="font-semibold">Pro Trial</span> — {planStatus.trial.daysLeft} day{planStatus.trial.daysLeft !== 1 ? 's' : ''} remaining
              </p>
              <p className="text-xs text-[#8b949e] mt-0.5">
                You have full access to all features. After the trial, you&apos;ll be moved to the free plan.
              </p>
            </div>
          </div>
        )}

        {/* Expired trial / free plan banner */}
        {planStatus && !isPro && !planStatus.trial.active && (
          <div className="bg-[#58a6ff]/10 border border-[#58a6ff]/30 rounded-lg px-4 py-3 flex items-center gap-3">
            <Lock size={16} className="text-[#58a6ff] shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-[#e6edf3]">
                <span className="font-semibold">Free Plan</span> — limited to {features?.maxAssets} assets and RSI only
              </p>
              <p className="text-xs text-[#8b949e] mt-0.5">
                Upgrade to Pro for all 12 assets, 4 strategies, backtesting, SL/TP, and push notifications.
              </p>
            </div>
            <button className="shrink-0 text-xs px-4 py-2 bg-[#58a6ff] text-[#0d1117] font-semibold rounded-lg hover:bg-[#79b8ff] transition-colors">
              Upgrade
            </button>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold text-[#e6edf3] tracking-tight flex items-center gap-2">
              <span className="text-[#58a6ff]">◈</span> Trading Signals
            </h1>
            <p className="text-xs text-[#8b949e] mt-0.5">
              {enabledStrategies.length === 1 ? 'Single' : 'Multi'}-strategy signals · T212
            </p>
          </div>

          <div className="flex items-center gap-3">
            {!loading && (
              <div className="flex gap-2">
                {buys > 0 && (
                  <span className="text-xs bg-[#3fb950]/10 border border-[#3fb950]/30 text-[#3fb950] px-2 py-1 rounded-full font-semibold">
                    {buys} BUY
                  </span>
                )}
                {sells > 0 && (
                  <span className="text-xs bg-[#f85149]/10 border border-[#f85149]/30 text-[#f85149] px-2 py-1 rounded-full font-semibold">
                    {sells} SELL
                  </span>
                )}
              </div>
            )}

            <div className="flex items-center gap-1.5 text-xs text-[#8b949e]">
              {error ? (
                <WifiOff size={12} className="text-[#f85149]" />
              ) : loading ? (
                <RefreshCw size={12} className="animate-spin text-[#58a6ff]" />
              ) : (
                <Wifi size={12} className="text-[#3fb950]" />
              )}
              {lastFetch && !loading && (
                <span className="flex items-center gap-1">
                  <Clock size={10} />
                  {secondsAgo < 60 ? `${secondsAgo}s ago` : `${Math.floor(secondsAgo / 60)}m ago`}
                </span>
              )}
            </div>

            <button
              onClick={() => fetchAssets(true)}
              disabled={refreshing}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-[#21262d] border border-[#30363d] rounded-lg hover:bg-[#30363d] transition-colors disabled:opacity-50"
            >
              <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-[#21262d] border border-[#30363d] rounded-lg hover:bg-[#f85149]/20 hover:border-[#f85149]/30 hover:text-[#f85149] transition-colors"
              title="Sign out"
            >
              <LogOut size={12} />
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-[#f85149]/10 border border-[#f85149]/30 rounded-lg px-4 py-3 text-sm text-[#f85149]">
            {error}
          </div>
        )}

        {/* Main grid */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div className="xl:col-span-3 space-y-6">
            {/* Stocks */}
            <section>
              <h2 className="text-xs font-semibold text-[#8b949e] uppercase tracking-widest mb-3 flex items-center gap-2">
                <span className="w-4 h-px bg-[#30363d]" />
                Stocks
                <span className="w-full h-px bg-[#30363d]" />
              </h2>
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-3">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} className="bg-[#161b22] border border-[#30363d] rounded-xl h-40 animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-3">
                  {stocks.map((a) => (
                    <AssetCard
                      key={a.symbol}
                      data={a}
                      buyThreshold={notifSettings.buyThreshold}
                      sellThreshold={notifSettings.sellThreshold}
                      enabledStrategies={enabledStrategies}
                      isPro={isPro}
                    />
                  ))}
                  {lockedStocks.map((a) => (
                    <LockedAssetCard key={a.symbol} symbol={a.symbol} name={a.name} type={a.type} />
                  ))}
                </div>
              )}
            </section>

            {/* Crypto */}
            <section>
              <h2 className="text-xs font-semibold text-[#8b949e] uppercase tracking-widest mb-3 flex items-center gap-2">
                <span className="w-4 h-px bg-[#30363d]" />
                Crypto
                <span className="w-full h-px bg-[#30363d]" />
              </h2>
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="bg-[#161b22] border border-[#30363d] rounded-xl h-40 animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {crypto.map((a) => (
                    <AssetCard
                      key={a.symbol}
                      data={a}
                      buyThreshold={notifSettings.buyThreshold}
                      sellThreshold={notifSettings.sellThreshold}
                      enabledStrategies={enabledStrategies}
                      isPro={isPro}
                    />
                  ))}
                  {lockedCrypto.map((a) => (
                    <LockedAssetCard key={a.symbol} symbol={a.symbol} name={a.name} type={a.type} />
                  ))}
                </div>
              )}
            </section>

            {/* Signal History */}
            {signalHistory.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold text-[#8b949e] uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span className="w-4 h-px bg-[#30363d]" />
                  Signal History
                  <button
                    onClick={() => setSignalHistory([])}
                    className="text-[10px] text-[#8b949e]/60 hover:text-[#f85149] ml-auto"
                  >
                    clear
                  </button>
                </h2>
                <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden">
                  {signalHistory.slice(0, 20).map((entry, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 px-4 py-2.5 border-b border-[#30363d]/50 last:border-0 hover:bg-[#1c2128] transition-colors"
                    >
                      <SignalBadge signal={entry.signal} size="sm" />
                      <span className="font-mono text-xs text-[#e6edf3] font-semibold w-16">
                        {entry.symbol.replace('-USD', '')}
                      </span>
                      <span className="text-xs text-[#8b949e]">{entry.name}</span>
                      <span className="text-xs font-mono text-[#e6edf3] ml-auto">
                        {formatPrice(entry.price)}
                      </span>
                      <span className="text-xs text-[#8b949e] w-16 text-right font-mono">
                        RSI {entry.rsi?.toFixed(1) ?? '—'}
                      </span>
                      <span className="text-[10px] text-[#8b949e] w-28 text-right">
                        {new Date(entry.timestamp).toLocaleString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar — desktop only */}
          <div className="hidden xl:block space-y-4">
            <SidebarContent
              notifSettings={notifSettings}
              setNotifSettings={setNotifSettings}
              enabledStrategies={enabledStrategies}
              setEnabledStrategies={setEnabledStrategies}
              assets={[...stocks, ...crypto]}
              loading={loading}
              features={features}
              isPro={isPro}
            />
          </div>
        </div>
      </div>

      {/* Mobile FAB */}
      <button
        onClick={() => setDrawerOpen(true)}
        className="xl:hidden fixed bottom-5 right-5 z-40 w-12 h-12 bg-[#58a6ff] rounded-full flex items-center justify-center shadow-lg shadow-[#58a6ff]/20 active:scale-95 transition-transform"
      >
        <SlidersHorizontal size={20} className="text-[#0d1117]" />
      </button>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="xl:hidden fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="relative w-[85%] max-w-sm bg-[#0d1117] h-full overflow-y-auto p-4 space-y-4 animate-slide-in">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-[#e6edf3]">Settings & Tools</h2>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-1.5 rounded-lg hover:bg-[#21262d] transition-colors"
              >
                <X size={18} className="text-[#8b949e]" />
              </button>
            </div>
            <SidebarContent
              notifSettings={notifSettings}
              setNotifSettings={setNotifSettings}
              enabledStrategies={enabledStrategies}
              setEnabledStrategies={setEnabledStrategies}
              assets={[...stocks, ...crypto]}
              loading={loading}
              features={features}
              isPro={isPro}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sidebar                                                            */
/* ------------------------------------------------------------------ */

function SidebarContent({
  notifSettings,
  setNotifSettings,
  enabledStrategies,
  setEnabledStrategies,
  assets,
  loading,
  features,
  isPro,
}: {
  notifSettings: NotificationSettings;
  setNotifSettings: (v: NotificationSettings) => void;
  enabledStrategies: string[];
  setEnabledStrategies: (v: string[]) => void;
  assets: AssetData[];
  loading: boolean;
  features: PlanFeatures | null;
  isPro: boolean;
}) {
  return (
    <>
      {/* Notifications — pro only */}
      {isPro ? (
        <NotificationPanel settings={notifSettings} onChange={setNotifSettings} />
      ) : (
        <div className="relative">
          <div className="opacity-40 pointer-events-none">
            <NotificationPanel settings={notifSettings} onChange={setNotifSettings} />
          </div>
          <div className="absolute inset-0 flex items-center justify-center bg-[#0d1117]/60 rounded-xl border border-[#d29922]/20">
            <div className="text-center">
              <Lock size={14} className="text-[#d29922] mx-auto mb-1" />
              <p className="text-[10px] text-[#d29922] font-semibold">Pro feature</p>
            </div>
          </div>
        </div>
      )}

      <StrategyPanel
        enabledStrategies={enabledStrategies}
        onChange={setEnabledStrategies}
        allowedStrategies={features?.strategies}
        showCombos={features?.combos ?? false}
      />

      {/* Backtest — pro only */}
      {isPro ? (
        !loading && assets.length > 0 && <BacktestPanel assets={assets} />
      ) : (
        <div className="relative">
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4 opacity-40">
            <p className="text-sm font-semibold text-[#e6edf3] mb-2">Backtest</p>
            <div className="space-y-2">
              <div className="h-8 bg-[#0d1117] rounded-lg" />
              <div className="h-8 bg-[#0d1117] rounded-lg" />
            </div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center bg-[#0d1117]/60 rounded-xl border border-[#d29922]/20">
            <div className="text-center">
              <Lock size={14} className="text-[#d29922] mx-auto mb-1" />
              <p className="text-[10px] text-[#d29922] font-semibold">Pro feature</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4 space-y-2">
        <h2 className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider">Info</h2>
        <div className="space-y-1.5 text-xs text-[#8b949e]">
          <p>Auto-refreshes every <span className="text-[#e6edf3]">{(features?.pollInterval ?? 60)}s</span></p>
          <p>RSI calculated on <span className="text-[#e6edf3]">daily candles</span></p>
          <p>14-period Wilder&apos;s smoothed RSI</p>
          <p className="pt-1 border-t border-[#30363d]">
            Data via <span className="text-[#58a6ff]">Stooq</span> &amp; <span className="text-[#58a6ff]">CoinGecko</span>
          </p>
          <p>Notifications via <span className="text-[#58a6ff]">ntfy.sh</span></p>
        </div>
      </div>
    </>
  );
}
