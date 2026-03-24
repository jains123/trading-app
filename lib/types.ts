export type SignalType = 'BUY' | 'SELL' | 'HOLD' | 'LOADING' | 'ERROR';
export type AssetType = 'stock' | 'crypto';

export interface Asset {
  symbol: string;
  name: string;
  type: AssetType;
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
