'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, X, Plus, Check, Loader2 } from 'lucide-react';

interface SearchResult {
  symbol: string;
  name: string;
  type: 'stock' | 'crypto';
  stooqSymbol?: string;
  geckoId?: string;
}

interface WatchlistItem {
  symbol: string;
  name: string;
  type: 'stock' | 'crypto';
  stooqSymbol?: string;
  geckoId?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  watchlist: WatchlistItem[];
  onAdd: (item: WatchlistItem) => void;
  onRemove: (symbol: string) => void;
  maxAssets: number;
}

export default function AssetSearch({ open, onClose, watchlist, onAdd, onRemove, maxAssets }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<'all' | 'stock' | 'crypto'>('all');
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const watchlistSymbols = new Set(watchlist.map((w) => w.symbol));
  const atLimit = watchlist.length >= maxAssets;

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery('');
      setResults([]);
    }
  }, [open]);

  const doSearch = useCallback(
    async (q: string, type: string) => {
      if (q.length < 1) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&type=${type}`);
        const data = await res.json();
        setResults(data.results ?? []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  function handleQueryChange(q: string) {
    setQuery(q);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(q, tab), 300);
  }

  function handleTabChange(newTab: 'all' | 'stock' | 'crypto') {
    setTab(newTab);
    if (query.length > 0) {
      doSearch(query, newTab);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-[#161b22] border border-[#30363d] rounded-xl shadow-2xl overflow-hidden">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#30363d]">
          <Search size={16} className="text-[#8b949e] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Search stocks or crypto..."
            className="flex-1 bg-transparent text-sm text-[#e6edf3] placeholder-[#8b949e]/50 outline-none"
          />
          <button onClick={onClose} className="p-1 hover:bg-[#21262d] rounded transition-colors">
            <X size={16} className="text-[#8b949e]" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-4 py-2 border-b border-[#30363d]">
          {(['all', 'stock', 'crypto'] as const).map((t) => (
            <button
              key={t}
              onClick={() => handleTabChange(t)}
              className={`text-[10px] px-3 py-1 rounded-full font-semibold uppercase tracking-wider transition-colors ${
                tab === t
                  ? 'bg-[#58a6ff]/10 text-[#58a6ff]'
                  : 'text-[#8b949e] hover:text-[#e6edf3]'
              }`}
            >
              {t === 'all' ? 'All' : t === 'stock' ? 'Stocks' : 'Crypto'}
            </button>
          ))}
          <span className="ml-auto text-[10px] text-[#8b949e] self-center">
            {watchlist.length}/{maxAssets} assets
          </span>
        </div>

        {/* Results */}
        <div className="max-h-[50vh] overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={20} className="animate-spin text-[#58a6ff]" />
            </div>
          )}

          {!loading && query.length > 0 && results.length === 0 && (
            <div className="py-8 text-center text-sm text-[#8b949e]">
              No results found
            </div>
          )}

          {!loading && results.map((r) => {
            const inWatchlist = watchlistSymbols.has(r.symbol);
            return (
              <div
                key={r.symbol}
                className="flex items-center gap-3 px-4 py-3 hover:bg-[#1c2128] transition-colors border-b border-[#30363d]/30 last:border-0"
              >
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-medium uppercase tracking-wide shrink-0 ${
                    r.type === 'crypto'
                      ? 'bg-[#58a6ff]/10 text-[#58a6ff]'
                      : 'bg-[#8b949e]/10 text-[#8b949e]'
                  }`}
                >
                  {r.type === 'crypto' ? 'CRYPTO' : 'STOCK'}
                </span>
                <div className="flex-1 min-w-0">
                  <span className="font-mono font-semibold text-sm text-[#e6edf3]">
                    {r.symbol.replace('-USD', '')}
                  </span>
                  <span className="text-xs text-[#8b949e] ml-2 truncate">{r.name}</span>
                </div>
                {inWatchlist ? (
                  <button
                    onClick={() => onRemove(r.symbol)}
                    className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold bg-[#3fb950]/10 text-[#3fb950] rounded-lg hover:bg-[#f85149]/10 hover:text-[#f85149] transition-colors"
                  >
                    <Check size={12} />
                    Added
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (!atLimit) {
                        onAdd({
                          symbol: r.symbol,
                          name: r.name,
                          type: r.type,
                          stooqSymbol: r.stooqSymbol,
                          geckoId: r.geckoId,
                        });
                      }
                    }}
                    disabled={atLimit}
                    className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold bg-[#58a6ff]/10 text-[#58a6ff] rounded-lg hover:bg-[#58a6ff]/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Plus size={12} />
                    Add
                  </button>
                )}
              </div>
            );
          })}

          {/* Current watchlist when no search */}
          {!loading && query.length === 0 && (
            <div>
              <div className="px-4 py-2 text-[10px] text-[#8b949e] font-semibold uppercase tracking-widest">
                Your watchlist
              </div>
              {watchlist.map((w) => (
                <div
                  key={w.symbol}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#1c2128] transition-colors border-b border-[#30363d]/30 last:border-0"
                >
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-medium uppercase tracking-wide shrink-0 ${
                      w.type === 'crypto'
                        ? 'bg-[#58a6ff]/10 text-[#58a6ff]'
                        : 'bg-[#8b949e]/10 text-[#8b949e]'
                    }`}
                  >
                    {w.type === 'crypto' ? 'CRYPTO' : 'STOCK'}
                  </span>
                  <div className="flex-1">
                    <span className="font-mono font-semibold text-xs text-[#e6edf3]">
                      {w.symbol.replace('-USD', '')}
                    </span>
                    <span className="text-xs text-[#8b949e] ml-2">{w.name}</span>
                  </div>
                  <button
                    onClick={() => onRemove(w.symbol)}
                    className="p-1 hover:bg-[#f85149]/10 rounded transition-colors"
                  >
                    <X size={14} className="text-[#8b949e] hover:text-[#f85149]" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
