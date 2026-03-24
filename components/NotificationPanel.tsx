'use client';

import { useState } from 'react';
import { Bell, BellOff, Send, Check, X } from 'lucide-react';
import type { NotificationSettings } from '@/lib/types';

interface Props {
  settings: NotificationSettings;
  onChange: (s: NotificationSettings) => void;
}

export default function NotificationPanel({ settings, onChange }: Props) {
  const [testStatus, setTestStatus] = useState<'idle' | 'sending' | 'ok' | 'err'>('idle');
  const [localTopic, setLocalTopic] = useState(settings.ntfyTopic);

  function save() {
    onChange({ ...settings, ntfyTopic: localTopic });
  }

  async function sendTest() {
    if (!localTopic) return;
    setTestStatus('sending');
    try {
      const res = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: localTopic,
          title: '📡 Trading Signals Connected',
          message: 'Test notification from your Trading Signals dashboard.',
          priority: 3,
          tags: ['white_check_mark'],
        }),
      });
      setTestStatus(res.ok ? 'ok' : 'err');
    } catch {
      setTestStatus('err');
    }
    setTimeout(() => setTestStatus('idle'), 3000);
  }

  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-[#58a6ff]" />
          <h2 className="text-sm font-semibold text-[#e6edf3]">Phone Notifications</h2>
        </div>
        <button
          onClick={() => onChange({ ...settings, enabled: !settings.enabled })}
          className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border transition-colors ${
            settings.enabled
              ? 'bg-[#3fb950]/10 border-[#3fb950]/30 text-[#3fb950]'
              : 'bg-[#8b949e]/10 border-[#30363d] text-[#8b949e]'
          }`}
        >
          {settings.enabled ? <Bell size={12} /> : <BellOff size={12} />}
          {settings.enabled ? 'Enabled' : 'Disabled'}
        </button>
      </div>

      <div className="text-xs text-[#8b949e] bg-[#0d1117] border border-[#30363d] rounded-lg p-3 space-y-1">
        <p className="font-semibold text-[#e6edf3]">Setup (free, 1 min)</p>
        <p>1. Download the <span className="text-[#58a6ff]">ntfy</span> app (iOS / Android)</p>
        <p>2. Create a unique topic name below (keep it private)</p>
        <p>3. Subscribe to that topic in the app</p>
        <p>4. You&apos;ll receive BUY/SELL alerts on your phone</p>
      </div>

      <div className="space-y-2">
        <label className="text-xs text-[#8b949e]">ntfy.sh Topic</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={localTopic}
            onChange={(e) => setLocalTopic(e.target.value)}
            placeholder="my-trading-signals-abc123"
            className="flex-1 bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-[#e6edf3] placeholder-[#8b949e]/50 focus:outline-none focus:border-[#58a6ff]/60 font-mono"
          />
          <button
            onClick={save}
            className="bg-[#58a6ff]/10 border border-[#58a6ff]/30 text-[#58a6ff] text-xs px-3 py-2 rounded-lg hover:bg-[#58a6ff]/20 transition-colors"
          >
            Save
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={sendTest}
          disabled={!localTopic || testStatus === 'sending'}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-[#30363d] text-[#8b949e] hover:text-[#e6edf3] hover:border-[#58a6ff]/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {testStatus === 'sending' ? (
            <span className="animate-spin">⟳</span>
          ) : testStatus === 'ok' ? (
            <Check size={12} className="text-[#3fb950]" />
          ) : testStatus === 'err' ? (
            <X size={12} className="text-[#f85149]" />
          ) : (
            <Send size={12} />
          )}
          {testStatus === 'ok'
            ? 'Sent!'
            : testStatus === 'err'
              ? 'Failed'
              : testStatus === 'sending'
                ? 'Sending...'
                : 'Send Test'}
        </button>

        <p className="text-[10px] text-[#8b949e]">
          Notifies on signal change only (BUY ↔ HOLD ↔ SELL)
        </p>
      </div>

      {/* Thresholds */}
      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#30363d]">
        <div className="space-y-1">
          <label className="text-xs text-[#3fb950]/80">Buy Threshold (RSI ≤)</label>
          <input
            type="number"
            min={1}
            max={49}
            value={settings.buyThreshold}
            onChange={(e) => onChange({ ...settings, buyThreshold: Number(e.target.value) })}
            className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-1.5 text-sm text-[#3fb950] font-mono focus:outline-none focus:border-[#3fb950]/60"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-[#f85149]/80">Sell Threshold (RSI ≥)</label>
          <input
            type="number"
            min={51}
            max={99}
            value={settings.sellThreshold}
            onChange={(e) => onChange({ ...settings, sellThreshold: Number(e.target.value) })}
            className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-1.5 text-sm text-[#f85149] font-mono focus:outline-none focus:border-[#f85149]/60"
          />
        </div>
      </div>
    </div>
  );
}
