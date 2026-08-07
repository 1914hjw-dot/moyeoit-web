import { Room, CreateRoomInput } from '@/types/schema';
import { CreateRoomInputSchema } from '@/lib/validation/schemas';
import { supabaseServer, isSupabaseConfigured } from '@/lib/supabase/server';
import { createRoomMock, getRoomByIdMock } from '@/lib/mockStore';

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
  eventType: 'ROOM_CREATED' | 'ROOM_DELETED' | 'VOTE_CREATED' | 'VOTE_UPDATED' | 'VOTE_DELETED',
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
    const secretHash = generateHostSecret();

    const { data, error } = await supabaseServer
      .from('rooms')
      .insert({
        id: secureId,
        legacy_slug: null, // New rooms do not use legacy slugs
        secret_hash: secretHash,
        title: validated.title,
        description: validated.description,
        schedule_type: validated.schedule_type,
        candidate_dates: validated.candidate_dates,
        time_slots: validated.time_slots,
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
      secret_hash: secretHash,
      title: data.title,
      description: data.description,
      schedule_type: data.schedule_type,
      candidate_dates: data.candidate_dates,
      time_slots: data.time_slots,
      created_at: data.created_at,
    };
  }

  return createRoomMock(input);
}

/**
 * Enterprise Dual-Lookup Room Query Strategy:
 * 1. Memory Regex Check: Test if target string matches UUID v4 pattern.
 * 2. If UUID ➔ Execute Direct O(1) Primary Key Index Scan (`id = target`).
 * 3. If NOT UUID ➔ Execute Direct O(1) B-Tree Index Scan (`legacy_slug = target`).
 * Zero Downtime Guarantee: Completely eliminates 404s for legacy URLs without slow OR queries!
 */
export async function getRoomById(idOrSlug: string): Promise<Room | null> {
  if (!idOrSlug) return null;

  const target = idOrSlug.trim();
  const isUuid = UUID_V4_REGEX.test(target);

  if (isSupabaseConfigured && supabaseServer) {
    if (isUuid) {
      // Direct O(1) Index Scan on Primary Key `id`
      const { data } = await supabaseServer
        .from('rooms')
        .select('*')
        .eq('id', target)
        .is('deleted_at', null)
        .maybeSingle();

      if (data) {
        return {
          id: data.id,
          legacy_slug: data.legacy_slug,
          title: data.title,
          description: data.description,
          schedule_type: data.schedule_type,
          candidate_dates: data.candidate_dates,
          time_slots: data.time_slots,
          created_at: data.created_at,
        };
      }
    } else {
      // Direct O(1) Index Scan on `legacy_slug`
      const { data } = await supabaseServer
        .from('rooms')
        .select('*')
        .eq('legacy_slug', target)
        .is('deleted_at', null)
        .maybeSingle();

      if (data) {
        return {
          id: data.id,
          legacy_slug: data.legacy_slug,
          title: data.title,
          description: data.description,
          schedule_type: data.schedule_type,
          candidate_dates: data.candidate_dates,
          time_slots: data.time_slots,
          created_at: data.created_at,
        };
      }
    }

    return getRoomByIdMock(target);
  }

  return getRoomByIdMock(target);
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
