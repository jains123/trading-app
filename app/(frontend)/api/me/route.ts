import { NextResponse } from 'next/server';
import { headers as getHeaders } from 'next/headers';
import { getPayload } from 'payload';
import config from '@payload-config';
import { resolveUserPlan } from '@/lib/plans';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const payload = await getPayload({ config });
    const headersList = await getHeaders();

    // Verify the JWT from the cookie
    const { user } = await payload.auth({ headers: headersList });

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const planStatus = resolveUserPlan(
      (user as any).plan,
      (user as any).trialEndsAt,
    );

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: (user as any).name ?? null,
      ...planStatus,
    });
  } catch {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
}
