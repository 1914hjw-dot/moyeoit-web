import { Vote, SubmitVoteInput, DeleteVoteInput } from '@/types/schema';
import { SubmitVoteInputSchema, DeleteVoteInputSchema } from '@/lib/validation/schemas';
import { supabaseServer, isSupabaseConfigured } from '@/lib/supabase/server';
import { getVotesByRoomIdMock, submitVoteMock } from '@/lib/mockStore';
import { hashPassword } from '@/lib/crypto';
import { logAuditTrail } from './roomService';

export class VoteConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'VoteConflictError';
  }
}

// In-Memory Rate Limiter for password brute-force prevention
const FAILED_ATTEMPTS: Record<string, { count: number; lastTime: number }> = {};
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 60000;

function checkRateLimit(key: string): void {
  const now = Date.now();
  const record = FAILED_ATTEMPTS[key];
  if (record && record.count >= MAX_ATTEMPTS) {
    const elapsed = now - record.lastTime;
    if (elapsed < LOCKOUT_MS) {
      const remainingSec = Math.ceil((LOCKOUT_MS - elapsed) / 1000);
      throw new Error(`비밀번호 연속 실패로 제한되었습니다. ${remainingSec}초 후 다시 시도해 주세요.`);
    } else {
      FAILED_ATTEMPTS[key] = { count: 0, lastTime: now };
    }
  }
}

function recordFailedAttempt(key: string): void {
  const now = Date.now();
  const record = FAILED_ATTEMPTS[key] || { count: 0, lastTime: now };
  FAILED_ATTEMPTS[key] = { count: record.count + 1, lastTime: now };
}

function clearFailedAttempt(key: string): void {
  delete FAILED_ATTEMPTS[key];
}

function generateVoteToken(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `vt-${Math.random().toString(36).substring(2, 11)}-${Date.now()}`;
}

export async function getVotesByRoomId(roomId: string): Promise<Vote[]> {
  if (!roomId) return [];

  if (isSupabaseConfigured && supabaseServer) {
    const { data, error } = await supabaseServer
      .from('votes')
      .select('id, room_id, vote_token, nickname, availability, note, created_at, updated_at')
      .eq('room_id', roomId)
      .is('deleted_at', null);

    if (error || !data || data.length === 0) {
      return getVotesByRoomIdMock(roomId);
    }

    return data.map((v) => ({
      id: v.id,
      room_id: v.room_id,
      vote_token: v.vote_token,
      nickname: v.nickname,
      password_hash: undefined,
      availability: v.availability,
      note: v.note,
      created_at: v.created_at,
      updated_at: v.updated_at,
    }));
  }

  return getVotesByRoomIdMock(roomId);
}

export async function submitVote(input: SubmitVoteInput): Promise<Vote> {
  const validated = SubmitVoteInputSchema.parse(input);

  const attemptKey = `${validated.room_id}_${validated.nickname.toLowerCase()}`;
  const hashedInputPw = validated.password ? await hashPassword(validated.password) : '';

  if (isSupabaseConfigured && supabaseServer) {
    const { data: existingVotes } = await supabaseServer
      .from('votes')
      .select('*')
      .eq('room_id', validated.room_id)
      .ilike('nickname', validated.nickname)
      .is('deleted_at', null);

    const existing = existingVotes && existingVotes.length > 0 ? existingVotes[0] : null;

    if (existing) {
      checkRateLimit(attemptKey);

      // Verify vote ownership via Token OR Password Hash
      const tokenMatch = validated.vote_token && existing.vote_token && validated.vote_token === existing.vote_token;
      const pwMatch = existing.password_hash && hashedInputPw && existing.password_hash === hashedInputPw;

      if (existing.password_hash && !tokenMatch && !pwMatch) {
        recordFailedAttempt(attemptKey);
        throw new Error('비밀번호가 일치하지 않습니다. 본인의 닉네임과 설정한 비밀번호를 확인해 주세요.');
      }

      clearFailedAttempt(attemptKey);

      const { data: updated, error } = await supabaseServer
        .from('votes')
        .update({
          password_hash: hashedInputPw || existing.password_hash,
          availability: validated.availability,
          note: validated.note,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) {
        console.error('Supabase DB vote update failed:', error.message);
        return submitVoteMock(input);
      }

      logAuditTrail('VOTE_UPDATED', updated.id, { room_id: updated.room_id, nickname: updated.nickname });

      return {
        id: updated.id,
        room_id: updated.room_id,
        vote_token: updated.vote_token,
        nickname: updated.nickname,
        password_hash: undefined,
        availability: updated.availability,
        note: updated.note,
        created_at: updated.created_at,
        updated_at: updated.updated_at,
      };
    } else {
      const voteToken = generateVoteToken();
      const { data: inserted, error } = await supabaseServer
        .from('votes')
        .insert({
          room_id: validated.room_id,
          vote_token: voteToken,
          nickname: validated.nickname,
          password_hash: hashedInputPw,
          availability: validated.availability,
          note: validated.note,
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase DB vote insert error code:', error.code, error.message);
        if (error.code === '23505' || error.message?.includes('unique_room_nickname') || error.message?.includes('duplicate key')) {
          throw new VoteConflictError('이미 등록된 닉네임입니다. 본인의 닉네임인 경우 수정 비밀번호를 입력하시거나 다른 닉네임을 사용해 주세요.');
        }
        return submitVoteMock(input);
      }

      logAuditTrail('VOTE_CREATED', inserted.id, { room_id: inserted.room_id, nickname: inserted.nickname });

      return {
        id: inserted.id,
        room_id: inserted.room_id,
        vote_token: inserted.vote_token,
        nickname: inserted.nickname,
        password_hash: undefined,
        availability: inserted.availability,
        note: inserted.note,
        created_at: inserted.created_at,
        updated_at: inserted.updated_at,
      };
    }
  }

  return submitVoteMock(input);
}

export async function deleteVote(input: DeleteVoteInput): Promise<{ success: boolean }> {
  const validated = DeleteVoteInputSchema.parse(input);

  const attemptKey = `${validated.room_id}_${validated.nickname.toLowerCase()}`;
  const hashedInputPw = validated.password ? await hashPassword(validated.password) : '';

  if (isSupabaseConfigured && supabaseServer) {
    const { data: existingVotes } = await supabaseServer
      .from('votes')
      .select('*')
      .eq('room_id', validated.room_id)
      .ilike('nickname', validated.nickname)
      .is('deleted_at', null);

    const existing = existingVotes && existingVotes.length > 0 ? existingVotes[0] : null;

    if (!existing) {
      throw new Error('닉네임 또는 PIN이 올바르지 않습니다.');
    }

    checkRateLimit(attemptKey);

    const tokenMatch = validated.vote_token && existing.vote_token && validated.vote_token === existing.vote_token;
    const pwMatch = existing.password_hash && hashedInputPw && existing.password_hash === hashedInputPw;

    if (existing.password_hash && !tokenMatch && !pwMatch) {
      recordFailedAttempt(attemptKey);
      throw new Error('닉네임 또는 PIN이 올바르지 않습니다.');
    }

    clearFailedAttempt(attemptKey);

    // Execute Soft Delete
    const { error } = await supabaseServer
      .from('votes')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', existing.id);

    if (error) {
      console.error('Supabase DB vote delete failed:', error.message);
      throw new Error('투표 삭제 중 오류가 발생했습니다.');
    }

    logAuditTrail('VOTE_DELETED', existing.id, { room_id: existing.room_id, nickname: existing.nickname });

    return { success: true };
  }

  return { success: true };
}
