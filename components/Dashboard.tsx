'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { RefreshCw, Wifi, WifiOff, Clock } from 'lucide-react';
import type { AssetData, NotificationSettings, SignalHistoryEntry, SignalType } from '@/lib/types';
import AssetCard from './AssetCard';
import NotificationPanel from './NotificationPanel';
import StrategyPanel from './StrategyPanel';
import SignalBadge from './SignalBadge';

const POLL_INTERVAL = 60_000; // 1 minute

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

  const abortRef = useRef<AbortController | null>(null);

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
        if (notifSettings.enabled && notifSettings.ntfyTopic) {
          const updatedPrev = { ...prevSignals };
          const newHistory: SignalHistoryEntry[] = [];

          for (const asset of newAssets) {
            if (asset.signal === 'LOADING' || asset.signal === 'ERROR') continue;
            const prev = prevSignals[asset.symbol];
            if (prev !== asset.signal && (asset.signal === 'BUY' || asset.signal === 'SELL')) {
              // Signal changed to actionable — notify
              const emoji = asset.signal === 'BUY' ? '🟢' : '🔴';
              try {
                await fetch('/api/notify', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    topic: notifSettings.ntfyTopic,
                    title: `${emoji} ${asset.signal}: ${asset.name} (${asset.symbol.replace('-USD', '')})`,
                    message: `Price: ${formatPrice(asset.price)}  |  RSI: ${asset.rsi?.toFixed(1) ?? '—'}\nMake your trade on T212`,
                    priority: 4,
                    tags: NOTIFY_TAGS[asset.signal] ?? [],
                  }),
                });
              } catch {
                // Notification failure shouldn't break the app
              }

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
          // Still track signals even if notifications are off
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
    [notifSettings.buyThreshold, notifSettings.sellThreshold, notifSettings.enabled, notifSettings.ntfyTopic],
  );

  // Initial fetch + polling
  useEffect(() => {
    fetchAssets();
    const interval = setInterval(() => fetchAssets(), POLL_INTERVAL);
    return () => {
      clearInterval(interval);
      abortRef.current?.abort();
    };
  }, [fetchAssets]);

  // Seconds counter
  useEffect(() => {
    const t = setInterval(() => {
      if (lastFetch) {
        setSecondsAgo(Math.floor((Date.now() - lastFetch.getTime()) / 1000));
      }
    }, 1000);
    return () => clearInterval(t);
  }, [lastFetch]);

  const stocks = assets.filter((a) => a.type === 'stock');
  const crypto = assets.filter((a) => a.type === 'crypto');
  const buys = assets.filter((a) => a.signal === 'BUY').length;
  const sells = assets.filter((a) => a.signal === 'SELL').length;

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3]">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold text-[#e6edf3] tracking-tight flex items-center gap-2">
              <span className="text-[#58a6ff]">◈</span> Trading Signals
            </h1>
            <p className="text-xs text-[#8b949e] mt-0.5">RSI-based buy/sell signals · T212</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Summary pills */}
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

            {/* Status */}
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
          </div>
        </div>

        {error && (
          <div className="bg-[#f85149]/10 border border-[#f85149]/30 rounded-lg px-4 py-3 text-sm text-[#f85149]">
            {error}
          </div>
        )}

        {/* Main grid */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Assets — takes 3 cols */}
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
                    />
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
                    />
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

          {/* Sidebar — 1 col */}
          <div className="space-y-4">
            <NotificationPanel settings={notifSettings} onChange={setNotifSettings} />
            <StrategyPanel
              enabledStrategies={enabledStrategies}
              onChange={setEnabledStrategies}
            />

            {/* Poll info */}
            <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4 space-y-2">
              <h2 className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider">Info</h2>
              <div className="space-y-1.5 text-xs text-[#8b949e]">
                <p>Auto-refreshes every <span className="text-[#e6edf3]">60s</span></p>
                <p>RSI calculated on <span className="text-[#e6edf3]">1h candles</span></p>
                <p>14-period Wilder&apos;s smoothed RSI</p>
                <p className="pt-1 border-t border-[#30363d]">
                  Data via <span className="text-[#58a6ff]">Yahoo Finance</span>
                </p>
                <p>Notifications via <span className="text-[#58a6ff]">ntfy.sh</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
