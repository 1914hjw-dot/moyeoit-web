import { Room, CreateRoomInput } from '@/types/schema';
import { CreateRoomInputSchema } from '@/lib/validation/schemas';
import { supabaseServer, isSupabaseConfigured } from '@/lib/supabase/server';
import { createRoomMock, getRoomByIdMock } from '@/lib/mockStore';

export async function createRoom(input: CreateRoomInput): Promise<Room> {
  // 1. Zod Validation
  const validated = CreateRoomInputSchema.parse(input);

  // 2. Supabase DB Fallback / Storage
  if (isSupabaseConfigured && supabaseServer) {
    const roomId = `moyeoit-${Math.random().toString(36).substring(2, 9)}`;
    const { data, error } = await supabaseServer
      .from('rooms')
      .insert({
        id: roomId,
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
      // Fallback to local store if DB connection fails
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

  // If Supabase not configured in current environment, use fallback store
  return createRoomMock(input);
}

export async function getRoomById(id: string): Promise<Room | null> {
  if (!id) return null;

  if (isSupabaseConfigured && supabaseServer) {
    const { data, error } = await supabaseServer
      .from('rooms')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      // Fallback to mock store for demo rooms
      return getRoomByIdMock(id);
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

  return getRoomByIdMock(id);
}
