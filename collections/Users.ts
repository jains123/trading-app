import type { CollectionConfig } from 'payload';

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  access: {
    create: () => true,
    read: ({ req: { user } }) => {
      if (!user) return false;
      return { id: { equals: user.id } };
    },
    update: ({ req: { user } }) => {
      if (!user) return false;
      return { id: { equals: user.id } };
    },
    delete: ({ req: { user } }) => {
      if (!user) return false;
      return { id: { equals: user.id } };
    },
  },
  hooks: {
    beforeChange: [
      ({ operation, data }) => {
        // On signup, give a 14-day pro trial
        if (operation === 'create') {
          const now = new Date();
          const trialEnd = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
          data.plan = 'pro';
          data.trialEndsAt = trialEnd.toISOString();
          data.trialStartedAt = now.toISOString();
          // Default watchlist — same as the original hardcoded list
          data.watchlist = [
            { symbol: 'AAPL', name: 'Apple', type: 'stock', stooqSymbol: 'AAPL.US' },
            { symbol: 'NVDA', name: 'NVIDIA', type: 'stock', stooqSymbol: 'NVDA.US' },
            { symbol: 'TSLA', name: 'Tesla', type: 'stock', stooqSymbol: 'TSLA.US' },
            { symbol: 'MSFT', name: 'Microsoft', type: 'stock', stooqSymbol: 'MSFT.US' },
            { symbol: 'GOOGL', name: 'Alphabet', type: 'stock', stooqSymbol: 'GOOGL.US' },
            { symbol: 'AMZN', name: 'Amazon', type: 'stock', stooqSymbol: 'AMZN.US' },
            { symbol: 'META', name: 'Meta', type: 'stock', stooqSymbol: 'META.US' },
            { symbol: 'BTC-USD', name: 'Bitcoin', type: 'crypto', geckoId: 'bitcoin' },
            { symbol: 'ETH-USD', name: 'Ethereum', type: 'crypto', geckoId: 'ethereum' },
            { symbol: 'SOL-USD', name: 'Solana', type: 'crypto', geckoId: 'solana' },
            { symbol: 'BNB-USD', name: 'BNB', type: 'crypto', geckoId: 'binancecoin' },
            { symbol: 'XRP-USD', name: 'XRP', type: 'crypto', geckoId: 'ripple' },
          ];
        }
        return data;
      },
    ],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'plan',
      type: 'select',
      defaultValue: 'free',
      options: [
        { label: 'Free', value: 'free' },
        { label: 'Pro', value: 'pro' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'trialEndsAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'trialStartedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'watchlist',
      type: 'json',
      defaultValue: [],
      admin: {
        description: 'User\'s custom asset watchlist as JSON array',
      },
    },
  ],
};
