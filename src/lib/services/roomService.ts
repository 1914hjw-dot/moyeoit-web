import 'server-only';

import {
  CreatedRoom,
  PublicRoom,
  Room,
} from '@/types/schema';
import { ConfirmRoomInputSchema, CreateRoomInputSchema } from '@/lib/validation/schemas';
import { supabaseServer } from '@/lib/supabase/server';
import { confirmRoomDateMock, createRoomMock, getRoomByIdMock } from '@/lib/mockStore';
import { AppError, ConfigurationError } from '@/lib/errors';
import {
  generateSecureToken,
  hashCapabilityToken,
  verifyCapabilityToken,
} from '@/lib/crypto';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const DEMO_ROOM_IDS = new Set(['demo-room-1', 'demo-room-2']);

export function isDemoRoomId(id: string): boolean {
  return DEMO_ROOM_IDS.has(id.trim());
}

export function toPublicRoom(room: Room): PublicRoom {
  return {
    id: room.id,
    legacy_slug: room.legacy_slug,
    title: room.title,
    description: room.description,
    schedule_type: room.schedule_type,
    candidate_dates: room.candidate_dates,
    time_slots: room.time_slots,
    status: room.status,
    confirmed_date: room.confirmed_date,
    confirmed_at: room.confirmed_at,
    date_selection_mode: room.date_selection_mode,
    created_at: room.created_at,
  };
}

function mapRoomRecord(data: Record<string, unknown>): Room {
  return {
    id: String(data.id),
    legacy_slug: typeof data.legacy_slug === 'string' ? data.legacy_slug : null,
    secret_hash: typeof data.secret_hash === 'string' ? data.secret_hash : null,
    title: String(data.title || ''),
    description: typeof data.description === 'string' ? data.description : '',
    schedule_type: data.schedule_type === 'date_time' ? 'date_time' : 'date_only',
    candidate_dates: Array.isArray(data.candidate_dates) ? data.candidate_dates.map(String) : [],
    time_slots: Array.isArray(data.time_slots) ? data.time_slots.map(String) : [],
    status: data.status === 'CONFIRMED' ? 'CONFIRMED' : 'OPEN',
    confirmed_date: typeof data.confirmed_date === 'string' ? data.confirmed_date : null,
    confirmed_at: typeof data.confirmed_at === 'string' ? data.confirmed_at : null,
    date_selection_mode: data.date_selection_mode === 'FREE' ? 'FREE' : 'RANGE',
    created_at: String(data.created_at || ''),
    deleted_at: typeof data.deleted_at === 'string' ? data.deleted_at : null,
  };
}

function ensureProductionDatabase(): void {
  if (!supabaseServer && process.env.NODE_ENV === 'production') {
    throw new ConfigurationError();
  }
}

function generateSecureUuid(): string {
  if (!globalThis.crypto?.randomUUID) {
    throw new AppError('안전한 식별자를 생성할 수 없습니다.', 503, 'CRYPTO_UNAVAILABLE');
  }
  return globalThis.crypto.randomUUID();
}

function generateShortSlug(): string {
  return `moyeoit-${generateSecureToken(9).toLowerCase()}`;
}

export async function logAuditTrail(
  eventType: string,
  targetId: string,
  payload?: Record<string, unknown>
): Promise<void> {
  if (!supabaseServer) return;

  const { error } = await supabaseServer.from('audit_logs').insert({
    event_type: eventType,
    target_id: targetId,
    payload: payload || null,
  });
  if (error) console.error('Audit trail logging failed:', error.message);
}

export async function createRoom(input: unknown): Promise<CreatedRoom> {
  const validated = CreateRoomInputSchema.parse(input);
  ensureProductionDatabase();

  const hostSecret = generateSecureToken();
  const secretHash = await hashCapabilityToken(hostSecret);

  if (supabaseServer) {
    const secureId = generateSecureUuid();
    const shortSlug = generateShortSlug();
    const { data, error } = await supabaseServer
      .from('rooms')
      .insert({
        id: secureId,
        legacy_slug: shortSlug,
        secret_hash: secretHash,
        title: validated.title,
        description: validated.description || '',
        schedule_type: validated.schedule_type,
        candidate_dates: validated.candidate_dates,
        time_slots: validated.time_slots,
        status: 'OPEN',
        date_selection_mode: validated.date_selection_mode,
      })
      .select(
        'id, legacy_slug, title, description, schedule_type, candidate_dates, time_slots, status, confirmed_date, confirmed_at, date_selection_mode, created_at'
      )
      .single();

    if (error || !data) {
      console.error('Supabase DB room creation error:', error?.message);
      throw new AppError('모임방을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.', 503, 'DATABASE_ERROR');
    }

    await logAuditTrail('ROOM_CREATED', data.id, { title: data.title });
    return {
      ...toPublicRoom(mapRoomRecord({ ...data, secret_hash: secretHash })),
      host_secret: hostSecret,
    };
  }

  const mockRoom = createRoomMock(validated);
  return { ...toPublicRoom(mockRoom), host_secret: hostSecret };
}

export async function getRoomById(idOrSlug: string): Promise<Room | null> {
  const target = idOrSlug.trim();
  if (!target || target.length > 100) return null;
  if (isDemoRoomId(target)) return getRoomByIdMock(target);

  ensureProductionDatabase();
  if (!supabaseServer) return getRoomByIdMock(target);

  let query = supabaseServer
    .from('rooms')
    .select(
      'id, legacy_slug, secret_hash, title, description, schedule_type, candidate_dates, time_slots, status, confirmed_date, confirmed_at, date_selection_mode, created_at, deleted_at'
    )
    .is('deleted_at', null);

  query = UUID_REGEX.test(target) ? query.eq('id', target) : query.eq('legacy_slug', target);
  const { data, error } = await query.maybeSingle();

  if (error) {
    console.error('Supabase DB getRoomById error:', error.message);
    throw new AppError('모임방 정보를 불러오지 못했습니다.', 503, 'DATABASE_ERROR');
  }

  return data ? mapRoomRecord(data) : null;
}

async function validateConfirmedDate(room: Room, confirmedDate: string): Promise<void> {
  if (room.date_selection_mode === 'RANGE') {
    const allowedKeys = new Set<string>();
    for (const date of room.candidate_dates) {
      if (room.schedule_type === 'date_time' && room.time_slots.length > 0) {
        for (const timeSlot of room.time_slots) allowedKeys.add(`${date}_${timeSlot}`);
      } else {
        allowedKeys.add(date);
      }
    }
    if (!allowedKeys.has(confirmedDate)) {
      throw new AppError('후보로 등록된 날짜와 시간대만 확정할 수 있습니다.', 400, 'INVALID_CONFIRMED_DATE');
    }
    return;
  }

  if (!DATE_REGEX.test(confirmedDate) || !supabaseServer) {
    throw new AppError('투표에 등록된 날짜만 확정할 수 있습니다.', 400, 'INVALID_CONFIRMED_DATE');
  }

  const { data, error } = await supabaseServer
    .from('votes')
    .select('availability')
    .eq('room_id', room.id)
    .is('deleted_at', null);
  if (error) {
    console.error('Supabase DB confirmation validation failed:', error.message);
    throw new AppError('확정할 날짜를 검증하지 못했습니다.', 503, 'DATABASE_ERROR');
  }

  const hasVote = (data || []).some((vote) => {
    const availability = vote.availability as Record<string, string> | null;
    return availability?.[confirmedDate] === 'possible' || availability?.[confirmedDate] === 'maybe';
  });
  if (!hasVote) {
    throw new AppError('참여자가 가능하다고 투표한 날짜만 확정할 수 있습니다.', 400, 'INVALID_CONFIRMED_DATE');
  }
}

export async function confirmRoomDate(input: unknown): Promise<Room> {
  const validated = ConfirmRoomInputSchema.parse(input);
  const room = await getRoomById(validated.room_id);

  if (!room) throw new AppError('존재하지 않는 약속 방입니다.', 404, 'ROOM_NOT_FOUND');
  if (isDemoRoomId(room.id)) {
    if (process.env.NODE_ENV === 'production') {
      throw new AppError('시연 모임방의 날짜는 확정할 수 없습니다.', 403, 'DEMO_READ_ONLY');
    }
    return confirmRoomDateMock(validated);
  }
  if (!room.secret_hash || !validated.host_secret) {
    throw new AppError('방장 권한을 확인할 수 없습니다.', 403, 'HOST_AUTH_REQUIRED');
  }
  if (!(await verifyCapabilityToken(validated.host_secret, room.secret_hash))) {
    throw new AppError('방장 권한이 없습니다.', 403, 'HOST_AUTH_FAILED');
  }
  if (room.status !== 'OPEN') {
    throw new AppError('이미 날짜가 확정된 모임방입니다.', 409, 'ROOM_ALREADY_CONFIRMED');
  }

  await validateConfirmedDate(room, validated.confirmed_date);
  if (!supabaseServer) throw new ConfigurationError();

  const now = new Date().toISOString();
  const { data, error } = await supabaseServer
    .from('rooms')
    .update({ status: 'CONFIRMED', confirmed_date: validated.confirmed_date, confirmed_at: now })
    .eq('id', room.id)
    .eq('status', 'OPEN')
    .select('confirmed_date, confirmed_at')
    .maybeSingle();

  if (error) {
    console.error('Supabase DB room confirmation failed:', error.message);
    throw new AppError('모임 날짜를 확정하지 못했습니다.', 503, 'DATABASE_ERROR');
  }
  if (!data) throw new AppError('이미 처리된 모임방입니다.', 409, 'ROOM_STATE_CONFLICT');

  await logAuditTrail('ROOM_CONFIRMED', room.id, { confirmed_date: validated.confirmed_date });
  return {
    ...room,
    status: 'CONFIRMED',
    confirmed_date: data.confirmed_date,
    confirmed_at: data.confirmed_at,
  };
}

export async function softDeleteRoom(id: string): Promise<boolean> {
  if (!id) return false;
  if (!supabaseServer) throw new ConfigurationError();

  const { error } = await supabaseServer
    .from('rooms')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);
  if (error) {
    console.error('Supabase DB softDeleteRoom failed:', error.message);
    throw new AppError('모임방을 삭제하지 못했습니다.', 503, 'DATABASE_ERROR');
  }

  await logAuditTrail('ROOM_DELETED', id);
  return true;
}
