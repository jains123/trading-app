import type { Asset } from './types';

export interface AssetMeta extends Asset {
  stooqSymbol?: string;   // for stocks: e.g. AAPL.US
  geckoId?: string;       // for crypto: CoinGecko coin ID
}

export const ASSETS: AssetMeta[] = [
  // Stocks — data via Stooq.com
  { symbol: 'AAPL',  name: 'Apple',     type: 'stock',  stooqSymbol: 'AAPL.US'  },
  { symbol: 'NVDA',  name: 'NVIDIA',    type: 'stock',  stooqSymbol: 'NVDA.US'  },
  { symbol: 'TSLA',  name: 'Tesla',     type: 'stock',  stooqSymbol: 'TSLA.US'  },
  { symbol: 'MSFT',  name: 'Microsoft', type: 'stock',  stooqSymbol: 'MSFT.US'  },
  { symbol: 'GOOGL', name: 'Alphabet',  type: 'stock',  stooqSymbol: 'GOOGL.US' },
  { symbol: 'AMZN',  name: 'Amazon',    type: 'stock',  stooqSymbol: 'AMZN.US'  },
  { symbol: 'META',  name: 'Meta',      type: 'stock',  stooqSymbol: 'META.US'  },
  // Crypto — data via CoinGecko
  { symbol: 'BTC-USD', name: 'Bitcoin',  type: 'crypto', geckoId: 'bitcoin'      },
  { symbol: 'ETH-USD', name: 'Ethereum', type: 'crypto', geckoId: 'ethereum'     },
  { symbol: 'SOL-USD', name: 'Solana',   type: 'crypto', geckoId: 'solana'       },
  { symbol: 'BNB-USD', name: 'BNB',      type: 'crypto', geckoId: 'binancecoin'  },
  { symbol: 'XRP-USD', name: 'XRP',      type: 'crypto', geckoId: 'ripple'       },
];

export const STOCK_ASSETS = ASSETS.filter((a) => a.type === 'stock');
export const CRYPTO_ASSETS = ASSETS.filter((a) => a.type === 'crypto');
