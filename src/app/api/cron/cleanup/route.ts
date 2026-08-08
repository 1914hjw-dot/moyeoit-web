import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer, isSupabaseConfigured } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  return handleCleanup(req);
}

export async function POST(req: NextRequest) {
  return handleCleanup(req);
}

async function handleCleanup(req: NextRequest) {
  // 1. Secret Key Authorization for Protected Execution
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

  // 2. Database Cleanup Query Execution
  if (!isSupabaseConfigured || !supabaseServer) {
    return NextResponse.json({
      success: true,
      message: 'Supabase is not configured in this environment.',
      deleted_records_count: 0,
    });
  }

  try {
    const nowIso = new Date().toISOString();

    // Call stored procedure purge_expired_records() for 90-day retention cleanup
    const { error: rpcError } = await supabaseServer.rpc('purge_expired_records');

    if (rpcError) {
      console.warn('RPC purge_expired_records warning:', rpcError.message);
    }

    // Direct fallback cleanup for soft-deleted or 90-day expired items
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();

    const { data: deletedVotes, error: voteError } = await supabaseServer
      .from('votes')
      .delete()
      .or(`deleted_at.lt.${ninetyDaysAgo},created_at.lt.${ninetyDaysAgo}`)
      .select('id');

    const { data: deletedRooms, error: roomError } = await supabaseServer
      .from('rooms')
      .delete()
      .or(`deleted_at.lt.${ninetyDaysAgo},created_at.lt.${ninetyDaysAgo}`)
      .select('id');

    if (voteError || roomError) {
      console.error('90-day Auto-cleanup failed:', voteError?.message || roomError?.message);
    }

    const totalRoomsPurged = deletedRooms ? deletedRooms.length : 0;
    const totalVotesPurged = deletedVotes ? deletedVotes.length : 0;

    return NextResponse.json({
      success: true,
      message: `Expired records 90-day retention cleanup completed successfully.`,
      purged_rooms_count: totalRoomsPurged,
      purged_votes_count: totalVotesPurged,
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
