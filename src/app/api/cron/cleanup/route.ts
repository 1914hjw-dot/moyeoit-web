import 'server-only';

import { NextRequest, NextResponse } from 'next/server';
import { timingSafeStringEqual } from '@/lib/crypto';
import { supabaseServer } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error('CRON_SECRET is not configured. Cleanup request rejected.');
    return NextResponse.json(
      { success: false, error: 'Cleanup service is not configured.' },
      { status: 503 }
    );
  }

  const authorization = request.headers.get('authorization') || '';
  const providedSecret = authorization.startsWith('Bearer ')
    ? authorization.slice('Bearer '.length)
    : '';
  if (!providedSecret || !timingSafeStringEqual(providedSecret, cronSecret)) {
    return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
  }
  if (!supabaseServer) {
    return NextResponse.json(
      { success: false, error: 'Database service is not configured.' },
      { status: 503 }
    );
  }

  try {
    const { data, error } = await supabaseServer.rpc('purge_expired_records');
    if (error) {
      console.error('Cleanup RPC failed:', error.message);
      return NextResponse.json({ success: false, error: 'Cleanup failed.' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Expired records cleanup completed.',
      result: data ?? null,
      executed_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Unexpected cleanup failure:', error);
    return NextResponse.json({ success: false, error: 'Cleanup failed.' }, { status: 500 });
  }
}
