import { Room, CreateRoomInput, ConfirmRoomInput } from '@/types/schema';
import { CreateRoomInputSchema, ConfirmRoomInputSchema } from '@/lib/validation/schemas';
import { supabaseServer, isSupabaseConfigured } from '@/lib/supabase/server';
import { createRoomMock, getRoomByIdMock, confirmRoomDateMock } from '@/lib/mockStore';

// ISO 8601 UUID v4 Regular Expression for Instant In-Memory Format Checking
const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function generateSecureUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  const bytes = new Uint8Array(16);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

// Generate branded short public identifier slug for user-facing URLs (e.g., moyeoit-x89ab3f)
function generateShortSlug(): string {
  return `moyeoit-${Math.random().toString(36).substring(2, 9)}`;
}

// Generate 32-byte Random Secret Hex Token for Host Administration
function generateHostSecret(): string {
  const bytes = new Uint8Array(32);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 32; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

// Audit Trail Logging Helper
export async function logAuditTrail(
  eventType: 'ROOM_CREATED' | 'ROOM_CONFIRMED' | 'ROOM_DELETED' | 'VOTE_CREATED' | 'VOTE_UPDATED' | 'VOTE_DELETED',
  targetId: string,
  payload?: any
): Promise<void> {
  if (!isSupabaseConfigured || !supabaseServer) return;
  try {
    await supabaseServer.from('audit_logs').insert({
      event_type: eventType,
      target_id: targetId,
      payload: payload ? JSON.stringify(payload) : null,
    });
  } catch (err) {
    console.error('Audit trail logging failed:', err);
  }
}

export async function createRoom(input: CreateRoomInput): Promise<Room> {
  const validated = CreateRoomInputSchema.parse(input);

  if (isSupabaseConfigured && supabaseServer) {
    const secureId = generateSecureUUID();
    const shortSlug = generateShortSlug();
    const secretHash = generateHostSecret();

    const { data, error } = await supabaseServer
      .from('rooms')
      .insert({
        id: secureId,
        legacy_slug: shortSlug,
        secret_hash: secretHash,
        title: validated.title,
        description: validated.description,
        schedule_type: validated.schedule_type,
        candidate_dates: validated.candidate_dates,
        time_slots: validated.time_slots,
        status: 'OPEN',
        confirmed_date: null,
        confirmed_at: null,
        date_selection_mode: validated.date_selection_mode || 'RANGE',
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase DB room creation failed:', error.message);
      return createRoomMock(input);
    }

    // Fire and forget Audit Log
    logAuditTrail('ROOM_CREATED', data.id, { title: data.title });

    return {
      id: data.id,
      legacy_slug: data.legacy_slug || shortSlug,
      secret_hash: secretHash,
      title: data.title,
      description: data.description,
      schedule_type: data.schedule_type,
      candidate_dates: data.candidate_dates,
      time_slots: data.time_slots,
      status: data.status || 'OPEN',
      confirmed_date: data.confirmed_date || null,
      confirmed_at: data.confirmed_at || null,
      date_selection_mode: data.date_selection_mode || 'RANGE',
      created_at: data.created_at,
    };
  }

  return createRoomMock(input);
}

export async function getRoomById(idOrSlug: string): Promise<Room | null> {
  if (!idOrSlug) return null;

  const target = idOrSlug.trim();
  const isUuid = UUID_V4_REGEX.test(target);

  if (isSupabaseConfigured && supabaseServer) {
    let query = supabaseServer.from('rooms').select('*').is('deleted_at', null);

    if (isUuid) {
      query = query.eq('id', target);
    } else {
      query = query.eq('legacy_slug', target);
    }

    const { data } = await query.maybeSingle();

    if (data) {
      return {
        id: data.id,
        legacy_slug: data.legacy_slug,
        secret_hash: data.secret_hash,
        title: data.title,
        description: data.description,
        schedule_type: data.schedule_type,
        candidate_dates: data.candidate_dates,
        time_slots: data.time_slots,
        status: data.status || 'OPEN',
        confirmed_date: data.confirmed_date || null,
        confirmed_at: data.confirmed_at || null,
        date_selection_mode: data.date_selection_mode || 'RANGE',
        created_at: data.created_at,
      };
    }

    return getRoomByIdMock(target);
  }

  return getRoomByIdMock(target);
}

/**
 * Confirm Room Date Endpoint Logic:
 * Server-Side Host Authorization Check:
 * Verifies host_secret against database secret_hash before mutating status to CONFIRMED.
 */
export async function confirmRoomDate(input: ConfirmRoomInput): Promise<Room> {
  const validated = ConfirmRoomInputSchema.parse(input);
  const room = await getRoomById(validated.room_id);

  if (!room) {
    throw new Error('존재하지 않는 약속 방입니다.');
  }

  // Server-Side Authorization Check
  if (room.secret_hash && validated.host_secret !== room.secret_hash) {
    throw new Error('방장 권한이 없습니다. 이 약속 방을 만든 브라우저에서만 확정이 가능합니다.');
  }

  if (isSupabaseConfigured && supabaseServer) {
    const now = new Date().toISOString();
    const { data, error } = await supabaseServer
      .from('rooms')
      .update({
        status: 'CONFIRMED',
        confirmed_date: validated.confirmed_date,
        confirmed_at: now,
      })
      .eq('id', room.id)
      .select()
      .single();

    if (error) {
      console.error('Supabase DB room confirmation failed:', error.message);
      return confirmRoomDateMock(validated);
    }

    logAuditTrail('ROOM_CONFIRMED', room.id, { confirmed_date: validated.confirmed_date });

    return {
      ...room,
      status: 'CONFIRMED',
      confirmed_date: data.confirmed_date,
      confirmed_at: data.confirmed_at,
    };
  }

  return confirmRoomDateMock(validated);
}

export async function softDeleteRoom(id: string): Promise<boolean> {
  if (!id) return false;
  if (isSupabaseConfigured && supabaseServer) {
    const { error } = await supabaseServer
      .from('rooms')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (!error) {
      logAuditTrail('ROOM_DELETED', id);
      return true;
    }
  }
  return false;
}
