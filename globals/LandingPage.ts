import type { GlobalConfig } from 'payload';

export const LandingPage: GlobalConfig = {
  slug: 'landing-page',
  label: 'Landing Page',
  access: {
    read: () => true,
  },
  fields: [
    // ---- Hero Section ----
    {
      name: 'hero',
      type: 'group',
      fields: [
        {
          name: 'headline',
          type: 'text',
          required: true,
          defaultValue: 'Real-Time Trading Signals',
        },
        {
          name: 'subheadline',
          type: 'textarea',
          defaultValue:
            'Multi-strategy analysis with RSI, MACD, Bollinger Bands and MA Crossover. Backtested signals with built-in risk management.',
        },
        {
          name: 'ctaText',
          type: 'text',
          label: 'CTA Button Text',
          defaultValue: 'Open Dashboard',
        },
        {
          name: 'ctaLink',
          type: 'text',
          label: 'CTA Button Link',
          defaultValue: '/dashboard',
        },
      ],
    },
    // ---- Features Section ----
    {
      name: 'features',
      type: 'array',
      label: 'Features',
      minRows: 1,
      maxRows: 8,
      defaultValue: [
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
      fields: [
        { name: 'icon', type: 'text', label: 'Icon name (lucide)' },
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'textarea', required: true },
      ],
    },
    // ---- Flexible Blocks ----
    {
      name: 'blocks',
      type: 'blocks',
      label: 'Page Sections',
      blocks: [
        {
          slug: 'stats',
          labels: { singular: 'Stats Row', plural: 'Stats Rows' },
          fields: [
            {
              name: 'items',
              type: 'array',
              fields: [
                { name: 'value', type: 'text', required: true },
                { name: 'label', type: 'text', required: true },
              ],
            },
          ],
        },
        {
          slug: 'testimonial',
          fields: [
            { name: 'quote', type: 'textarea', required: true },
            { name: 'author', type: 'text', required: true },
            { name: 'role', type: 'text' },
          ],
        },
        {
          slug: 'content',
          labels: { singular: 'Rich Text', plural: 'Rich Text' },
          fields: [
            { name: 'richText', type: 'richText' },
          ],
        },
        {
          slug: 'cta-banner',
          labels: { singular: 'CTA Banner', plural: 'CTA Banners' },
          fields: [
            { name: 'heading', type: 'text', required: true },
            { name: 'description', type: 'textarea' },
            { name: 'buttonText', type: 'text', required: true },
            { name: 'buttonLink', type: 'text', required: true },
          ],
        },
      ],
    },
    // ---- SEO ----
    {
      name: 'meta',
      type: 'group',
      label: 'SEO',
      fields: [
        {
          name: 'title',
          type: 'text',
          defaultValue: 'Trading Signals — Real-Time Technical Analysis',
        },
        {
          name: 'description',
          type: 'textarea',
          defaultValue:
            'Multi-strategy buy/sell signals for stocks and crypto with backtesting, risk management, and push notifications.',
        },
      ],
    },
  ],
};
