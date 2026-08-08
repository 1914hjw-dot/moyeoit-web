import { Room, CreateRoomInput, ConfirmRoomInput } from '@/types/schema';
import { CreateRoomInputSchema, ConfirmRoomInputSchema } from '@/lib/validation/schemas';
import { supabaseServer, isSupabaseConfigured } from '@/lib/supabase/server';
import { createRoomMock, getRoomByIdMock, confirmRoomDateMock } from '@/lib/mockStore';

const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function generateSecureUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function generateShortSlug(): string {
  const shortId = Math.random().toString(36).substring(2, 9);
  return `moyeoit-${shortId}`;
}

function generateHostSecret(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${crypto.randomUUID()}-${Date.now().toString(36)}`;
  }
  return `hs-${Math.random().toString(36).substring(2, 15)}-${Date.now()}`;
}

export async function logAuditTrail(
  eventType: string,
  targetId: string,
  payload?: Record<string, any>
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

    const insertPayload: Record<string, any> = {
      id: secureId,
      legacy_slug: shortSlug,
      secret_hash: secretHash,
      title: validated.title,
      description: validated.description || '',
      schedule_type: validated.schedule_type,
      candidate_dates: validated.candidate_dates,
      time_slots: validated.time_slots,
      status: 'OPEN',
      date_selection_mode: validated.date_selection_mode || 'RANGE',
    };

    const { data, error } = await supabaseServer
      .from('rooms')
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      console.error('Supabase DB room creation error:', error.message);
      throw new Error(`DB 모임방 생성 실패: ${error.message}`);
    }

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

    const { data, error } = await query.maybeSingle();

    if (error) {
      console.error('Supabase DB getRoomById error:', error.message);
      throw new Error(`DB 모임방 조회 실패: ${error.message}`);
    }

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

    return null;
  }

  return getRoomByIdMock(target);
}

export async function confirmRoomDate(input: ConfirmRoomInput): Promise<Room> {
  const validated = ConfirmRoomInputSchema.parse(input);
  const room = await getRoomById(validated.room_id);

  if (!room) {
    throw new Error('존재하지 않는 약속 방입니다.');
  }

  // Server-Side Host Authorization Check
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
      throw new Error(`DB 모임방 확정 실패: ${error.message}`);
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

    if (error) {
      console.error('Supabase DB softDeleteRoom failed:', error.message);
      throw new Error(`DB 모임방 삭제 실패: ${error.message}`);
    }

    logAuditTrail('ROOM_DELETED', id);
    return true;
  }
  return false;
}
