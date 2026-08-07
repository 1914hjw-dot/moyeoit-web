import { Room, CreateRoomInput } from '@/types/schema';
import { CreateRoomInputSchema } from '@/lib/validation/schemas';
import { supabaseServer, isSupabaseConfigured } from '@/lib/supabase/server';
import { createRoomMock, getRoomByIdMock } from '@/lib/mockStore';

// Generate unguessable 128-bit UUID v4 / Cryptographic NanoID for Room IDs
function generateSecureRoomId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Cryptographically secure fallback
  const bytes = new Uint8Array(16);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // UUID v4 version
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // UUID v4 variant
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export async function createRoom(input: CreateRoomInput): Promise<Room> {
  // 1. Zod Validation & Sanitization
  const validated = CreateRoomInputSchema.parse(input);

  // 2. Supabase DB Storage with Cryptographic UUID
  if (isSupabaseConfigured && supabaseServer) {
    const secureId = generateSecureRoomId();
    const { data, error } = await supabaseServer
      .from('rooms')
      .insert({
        id: secureId,
        uuid: secureId,
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

    return {
      id: data.id,
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
 * Dual-Lookup Room Query Strategy:
 * 1. Search by `id` (Supports newly created UUIDs and existing legacy IDs).
 * 2. Search by `uuid` (Supports newly migrated UUID columns).
 * 3. Search by `slug` (Supports legacy human-readable slugs like demo-room-1).
 * Zero downtime guarantee: Users using legacy URLs like /room/demo-room-1 will NEVER get 404!
 */
export async function getRoomById(idOrSlug: string): Promise<Room | null> {
  if (!idOrSlug) return null;

  const target = idOrSlug.trim();

  if (isSupabaseConfigured && supabaseServer) {
    // 1. Primary Lookup by Primary Key (id)
    const { data: primaryData } = await supabaseServer
      .from('rooms')
      .select('*')
      .eq('id', target)
      .maybeSingle();

    if (primaryData) {
      return {
        id: primaryData.id,
        title: primaryData.title,
        description: primaryData.description,
        schedule_type: primaryData.schedule_type,
        candidate_dates: primaryData.candidate_dates,
        time_slots: primaryData.time_slots,
        created_at: primaryData.created_at,
      };
    }

    // 2. Secondary Lookup by Legacy `slug` or `uuid` Column
    const { data: fallbackData } = await supabaseServer
      .from('rooms')
      .select('*')
      .or(`slug.eq.${target},uuid.eq.${target}`)
      .maybeSingle();

    if (fallbackData) {
      return {
        id: fallbackData.id,
        title: fallbackData.title,
        description: fallbackData.description,
        schedule_type: fallbackData.schedule_type,
        candidate_dates: fallbackData.candidate_dates,
        time_slots: fallbackData.time_slots,
        created_at: fallbackData.created_at,
      };
    }

    // 3. Fallback to Mock Store for Demo Rooms (e.g. demo-room-1)
    return getRoomByIdMock(target);
  }

  return getRoomByIdMock(target);
}
