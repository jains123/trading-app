/**
 * Plan definitions and feature gating.
 *
 * Free tier: limited assets, RSI only, no advanced features.
 * Pro tier:  everything — all assets, all strategies, backtesting, SL/TP, S/R levels.
 *
 * New users get 14-day Pro trial. After expiry, downgraded to Free.
 */

export type PlanId = 'free' | 'pro';

export type TimeframeId = 'short' | 'medium' | 'long';

export interface PlanFeatures {
  maxAssets: number;
  strategies: string[];
  timeframes: TimeframeId[];
  backtesting: boolean;
  sltp: boolean;
  levels: boolean;
  notifications: boolean;
  combos: boolean;
  pollInterval: number;             // seconds
}

export const PLAN_FEATURES: Record<PlanId, PlanFeatures> = {
  free: {
    maxAssets: 3,
    strategies: ['rsi'],
    timeframes: ['medium'],
    backtesting: false,
    sltp: false,
    levels: false,
    notifications: false,
    combos: false,
    pollInterval: 120,
  },
  pro: {
    maxAssets: 99,
    strategies: ['rsi', 'macd', 'bb', 'ma_cross'],
    timeframes: ['short', 'medium', 'long'],
    backtesting: true,
    sltp: true,
    levels: true,
    notifications: true,
    combos: true,
    pollInterval: 60,
  },
};

export interface UserPlanStatus {
  plan: PlanId;
  features: PlanFeatures;
  trial: {
    active: boolean;
    daysLeft: number;
    endsAt: string | null;
  };
}

/**
 * Resolve the effective plan for a user.
 * If they're on pro but their trial has expired (and they haven't paid), downgrade to free.
 */
export function resolveUserPlan(
  plan: string | undefined,
  trialEndsAt: string | undefined | null,
): UserPlanStatus {
  const now = new Date();
  const trialEnd = trialEndsAt ? new Date(trialEndsAt) : null;
  const trialActive = trialEnd ? now < trialEnd : false;
  const daysLeft = trialEnd
    ? Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)))
    : 0;

  // If plan is pro and trial is still active, they get pro
  // If plan is pro but trial expired, downgrade to free (until they pay)
  let effectivePlan: PlanId = 'free';
  if (plan === 'pro') {
    effectivePlan = trialActive ? 'pro' : 'free';
  }

  return {
    plan: effectivePlan,
    features: PLAN_FEATURES[effectivePlan],
    trial: {
      active: trialActive,
      daysLeft,
      endsAt: trialEndsAt ?? null,
    },
  };
}
