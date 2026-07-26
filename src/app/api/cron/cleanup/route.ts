import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer, isSupabaseConfigured } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  return handleCleanup(req);
}

export async function POST(req: NextRequest) {
  return handleCleanup(req);
}

async function handleCleanup(req: NextRequest) {
  // 1. Optional Secret Key Authorization for Protected Execution
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = req.headers.get('authorization') || '';
    const headerSecret = req.headers.get('x-cron-secret') || '';
    const querySecret = req.nextUrl.searchParams.get('secret') || '';

    const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : '';
    const providedSecret = bearerToken || headerSecret || querySecret;

    if (providedSecret !== cronSecret) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized cron request.' },
        { status: 401 }
      );
    }
  }

  // 2. Database Cleanup Query Execution (ON DELETE CASCADE purges associated votes automatically)
  if (!isSupabaseConfigured || !supabaseServer) {
    return NextResponse.json({
      success: true,
      message: 'Supabase is not configured in this environment.',
      deleted_rooms_count: 0,
    });
  }

  try {
    const nowIso = new Date().toISOString();

    const { data, error } = await supabaseServer
      .from('rooms')
      .delete()
      .not('expires_at', 'is', null)
      .lt('expires_at', nowIso)
      .select('id');

    if (error) {
      console.error('90-day Auto-cleanup failed:', error.message);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    const deletedCount = data ? data.length : 0;

    return NextResponse.json({
      success: true,
      message: `Expired rooms cleanup completed successfully.`,
      deleted_rooms_count: deletedCount,
      deleted_room_ids: data ? data.map((r) => r.id) : [],
      executed_at: nowIso,
    });
  } catch (error: any) {
    console.error('Unexpected error during auto-cleanup:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Auto-cleanup execution failed.' },
      { status: 500 }
    );
  }
}
