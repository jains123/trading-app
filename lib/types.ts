export type SignalType = 'BUY' | 'SELL' | 'HOLD' | 'LOADING' | 'ERROR';
export type AssetType = 'stock' | 'crypto';

export interface Asset {
  symbol: string;
  name: string;
  type: AssetType;
}

export interface StrategyDetail {
  signal: SignalType;
  value?: number | null;
  data?: Record<string, number | null> | null;
}

export interface SLTPData {
  stopLoss: number;
  takeProfit: number;
  riskReward: number;
  atr: number;
  atrPct: number;
}

export interface PriceLevelData {
  price: number;
  type: 'support' | 'resistance';
  strength: number;
  distance: number;
}

export interface BacktestData {
  totalReturn: number;
  winRate: number;
  tradeCount: number;
  avgWin: number;
  avgLoss: number;
  maxDrawdown: number;
  profitFactor: number;
  avgRR: number;
}

export interface AssetData {
  symbol: string;
  name: string;
  type: AssetType;
  price: number;
  priceChange: number;
  priceChangePct: number;
  rsi: number | null;
  signal: SignalType;
  strategySignals: Record<string, StrategyDetail>;
  sltp: SLTPData | null;
  levels: PriceLevelData[];
  backtest: BacktestData | null;
  sparkline: number[];
  lastUpdated: string;
  error?: boolean;
}

export interface Strategy {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  available: boolean;
}

export interface NotificationSettings {
  ntfyTopic: string;
  enabled: boolean;
  buyThreshold: number;
  sellThreshold: number;
}

export interface SignalHistoryEntry {
  symbol: string;
  name: string;
  signal: SignalType;
  price: number;
  rsi: number | null;
  timestamp: string;
}

export interface ApiAssetsResponse {
  assets: AssetData[];
  fetchedAt: string;
  errors?: string[];
}
