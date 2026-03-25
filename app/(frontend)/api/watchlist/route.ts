import { NextRequest, NextResponse } from 'next/server';
import { headers as getHeaders } from 'next/headers';
import { getPayload } from 'payload';
import config from '@payload-config';
import { resolveUserPlan } from '@/lib/plans';

export const dynamic = 'force-dynamic';

async function getUser() {
  const payload = await getPayload({ config });
  const headersList = await getHeaders();
  const { user } = await payload.auth({ headers: headersList });
  return { payload, user };
}

// GET — return the user's watchlist
export async function GET() {
  try {
    const { user } = await getUser();
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const watchlist = (user as any).watchlist ?? [];
    return NextResponse.json({ watchlist });
  } catch {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
}

// PUT — update the user's watchlist
export async function PUT(request: NextRequest) {
  try {
    const { payload, user } = await getUser();
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const body = await request.json();
    const watchlist = body.watchlist;

    if (!Array.isArray(watchlist)) {
      return NextResponse.json({ error: 'watchlist must be an array' }, { status: 400 });
    }

    // Enforce plan limits
    const plan = resolveUserPlan((user as any).plan, (user as any).trialEndsAt);
    if (watchlist.length > plan.features.maxAssets) {
      return NextResponse.json(
        { error: `Your plan allows up to ${plan.features.maxAssets} assets` },
        { status: 403 },
      );
    }

    // Validate each entry
    for (const item of watchlist) {
      if (!item.symbol || !item.name || !item.type) {
        return NextResponse.json({ error: 'Invalid watchlist entry' }, { status: 400 });
      }
      if (item.type === 'stock' && !item.stooqSymbol) {
        return NextResponse.json({ error: `Missing stooqSymbol for ${item.symbol}` }, { status: 400 });
      }
      if (item.type === 'crypto' && !item.geckoId) {
        return NextResponse.json({ error: `Missing geckoId for ${item.symbol}` }, { status: 400 });
      }
    }

    await payload.update({
      collection: 'users',
      id: user.id,
      data: { watchlist },
    });

    return NextResponse.json({ watchlist });
  } catch (err) {
    console.error('[watchlist] error:', err);
    return NextResponse.json({ error: 'Failed to update watchlist' }, { status: 500 });
  }
}
