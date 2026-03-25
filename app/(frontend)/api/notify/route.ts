import { NextRequest, NextResponse } from 'next/server';

interface NotifyPayload {
  topic: string;
  title: string;
  message: string;
  priority?: number;
  tags?: string[];
}

export async function POST(request: NextRequest) {
  try {
    const body: NotifyPayload = await request.json();

    if (!body.topic || !body.message) {
      return NextResponse.json({ error: 'topic and message are required' }, { status: 400 });
    }

    const res = await fetch('https://ntfy.sh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: body.topic,
        title: body.title ?? 'Trading Signal',
        message: body.message,
        priority: body.priority ?? 4,
        tags: body.tags ?? [],
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: `ntfy.sh error: ${text}` }, { status: res.status });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
