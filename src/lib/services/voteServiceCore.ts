import type {
  AvailabilityStatus,
  PublicVote,
  Room,
  Vote,
} from '../../types/schema.ts';
import {
  createPasswordHash,
  hasStoredPasswordHash,
} from '../crypto.ts';
import { AppError } from '../errors.ts';
import type { PinLockoutTarget } from '../security/pinLockoutCore.ts';
import { evaluateVoteMutationAuth } from '../security/voteAuth.ts';
import { isSameNickname } from '../validation/nickname.ts';
import {
  DeleteVoteInputSchema,
  SubmitVoteInputSchema,
  type SubmitVoteInputZod,
} from '../validation/schemas.ts';

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export class VoteConflictError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 409, 'VOTE_CONFLICT', details ? { details } : undefined);
    this.name = 'VoteConflictError';
  }
}

export interface VoteMutationContext {
  clientIp?: string | null;
}

export interface VoteServiceDeps {
  isProduction: boolean;
  getRoomById: (roomId: string) => Promise<Room | null>;
  isDemoRoomId: (roomId: string) => boolean;
  findActiveVoteById: (roomId: string, voteId: string) => Promise<Vote | null>;
  findActiveVotesByRoom: (roomId: string) => Promise<Vote[]>;
  insertVote: (record: {
    room_id: string;
    nickname: string;
    password_hash: string;
    availability: Record<string, AvailabilityStatus>;
    note: string;
  }) => Promise<{ vote?: Vote; conflict?: boolean }>;
  updateVote: (params: {
    id: string;
    room_id: string;
    password_hash: string;
    availability: Record<string, AvailabilityStatus>;
    note: string;
  }) => Promise<Vote | null>;
  softDeleteVote: (params: {
    id: string;
    room_id: string;
    expectedPasswordHash?: string | null;
    requireEmptyPassword?: boolean;
  }) => Promise<boolean>;
  assertVotePinNotLocked: (target: PinLockoutTarget) => Promise<void>;
  recordVotePinFailure: (
    target: PinLockoutTarget
  ) => Promise<{ locked: false; remainingAttempts: number }>;
  clearVotePinFailuresOnSuccess: (target: { roomId: string; voteId: string }) => Promise<void>;
  assertLegacyMutationAllowed: (roomId: string, clientIp?: string | null) => Promise<void>;
  logAuditTrail: (
    eventType: string,
    targetId: string,
    payload?: Record<string, unknown>,
    metadata?: { ipAddress?: string }
  ) => Promise<void>;
}

export function toPublicVote(vote: Vote): PublicVote {
  const hasPassword =
    typeof vote.has_password === 'boolean' && vote.password_hash === undefined
      ? vote.has_password
      : hasStoredPasswordHash(vote.password_hash);

  return {
    id: vote.id,
    room_id: vote.room_id,
    nickname: vote.nickname,
    has_password: hasPassword,
    availability: vote.availability,
    note: vote.note,
    created_at: vote.created_at,
    updated_at: vote.updated_at,
  };
}

export function validateAvailability(
  room: Room,
  availability: Record<string, string>
): void {
  const keys = Object.keys(availability);
  if (keys.length === 0) {
    throw new AppError('최소 한 개 이상의 날짜 응답이 필요합니다.', 400, 'EMPTY_AVAILABILITY');
  }

  if (room.date_selection_mode === 'FREE') {
    if (keys.length > 60 || keys.some((key) => !DATE_REGEX.test(key))) {
      throw new AppError(
        '자유 날짜 투표에는 올바른 날짜를 최대 60개까지 등록할 수 있습니다.',
        400,
        'INVALID_AVAILABILITY'
      );
    }
    return;
  }

  const allowedKeys = new Set<string>();
  for (const date of room.candidate_dates) {
    if (room.schedule_type === 'date_time' && room.time_slots.length > 0) {
      for (const timeSlot of room.time_slots) allowedKeys.add(`${date}_${timeSlot}`);
    } else {
      allowedKeys.add(date);
    }
  }

  if (keys.length > allowedKeys.size || keys.some((key) => !allowedKeys.has(key))) {
    throw new AppError(
      '이 모임방의 후보 날짜와 시간대만 투표할 수 있습니다.',
      400,
      'INVALID_AVAILABILITY'
    );
  }
}

async function findMatchingActiveVotes(
  deps: VoteServiceDeps,
  roomId: string,
  nickname: string
): Promise<Vote[]> {
  const votes = await deps.findActiveVotesByRoom(roomId);
  return votes.filter((vote) => isSameNickname(vote.nickname, nickname));
}

function buildConflictError(conflictVote?: Vote): VoteConflictError {
  return new VoteConflictError(
    '이미 등록된 이름입니다. 본인의 투표라면 기존 참여자를 선택해 수정하고, 동명이인이라면 구분되는 이름을 입력해 주세요.',
    conflictVote
      ? {
          existing_vote_id: conflictVote.id,
          existing_nickname: conflictVote.nickname,
          existing_has_password: hasStoredPasswordHash(conflictVote.password_hash),
        }
      : undefined
  );
}

async function performAuthenticatedUpdate(
  deps: VoteServiceDeps,
  targetRoom: Room,
  existing: Vote,
  validated: SubmitVoteInputZod,
  context?: VoteMutationContext
): Promise<PublicVote> {
  if (!hasStoredPasswordHash(existing.password_hash)) {
    throw new AppError(
      '비밀번호 없이 등록된 이전 투표는 직접 수정할 수 없습니다. 투표를 삭제한 뒤 비밀번호를 설정해 다시 투표해 주세요.',
      403,
      'LEGACY_VOTE_EDIT_DISABLED'
    );
  }

  const lockTarget: PinLockoutTarget = {
    roomId: targetRoom.id,
    voteId: existing.id,
    clientIp: context?.clientIp,
    nickname: existing.nickname,
  };

  await deps.assertVotePinNotLocked(lockTarget);

  const auth = await evaluateVoteMutationAuth({
    action: 'update',
    password: validated.password,
    storedPasswordHash: existing.password_hash,
  });

  if (!auth.authorized || auth.method !== 'pin') {
    const failure = await deps.recordVotePinFailure(lockTarget);
    throw new AppError(
      `비밀번호(PIN) 숫자 4자리가 일치하지 않습니다. (남은 시도 ${failure.remainingAttempts}회)`,
      403,
      'VOTE_AUTH_FAILED',
      { details: { remaining_attempts: failure.remainingAttempts } }
    );
  }

  await deps.clearVotePinFailuresOnSuccess({
    roomId: targetRoom.id,
    voteId: existing.id,
  });

  const nextPasswordHash = auth.needsRehash
    ? await createPasswordHash(validated.password)
    : existing.password_hash!.trim();

  const updated = await deps.updateVote({
    id: existing.id,
    room_id: targetRoom.id,
    password_hash: nextPasswordHash,
    availability: validated.availability,
    note: validated.note,
  });
  if (!updated) {
    throw new AppError('수정할 투표를 찾을 수 없습니다.', 404, 'VOTE_NOT_FOUND');
  }

  await deps.logAuditTrail(
    'VOTE_UPDATED',
    updated.id,
    {
      room_id: updated.room_id,
      vote_id: updated.id,
      nickname: updated.nickname,
      authorization: 'pin',
      hash_upgraded: auth.needsRehash,
    },
    { ipAddress: context?.clientIp || undefined }
  );

  return toPublicVote(updated);
}

async function insertNewVote(
  deps: VoteServiceDeps,
  targetRoom: Room,
  validated: SubmitVoteInputZod,
  context?: VoteMutationContext
): Promise<PublicVote> {
  const passwordHash = await createPasswordHash(validated.password);
  const insertResult = await deps.insertVote({
    room_id: targetRoom.id,
    nickname: validated.nickname,
    password_hash: passwordHash,
    availability: validated.availability,
    note: validated.note,
  });

  if (insertResult.conflict || !insertResult.vote) {
    const concurrentMatches = await findMatchingActiveVotes(
      deps,
      targetRoom.id,
      validated.nickname
    );
    throw buildConflictError(concurrentMatches[0]);
  }

  await deps.logAuditTrail(
    'VOTE_CREATED',
    insertResult.vote.id,
    {
      room_id: insertResult.vote.room_id,
      vote_id: insertResult.vote.id,
      nickname: insertResult.vote.nickname,
    },
    { ipAddress: context?.clientIp || undefined }
  );

  return toPublicVote(insertResult.vote);
}

export async function submitVoteWithDeps(
  deps: VoteServiceDeps,
  input: unknown,
  context?: VoteMutationContext
): Promise<PublicVote> {
  const validated = SubmitVoteInputSchema.parse(input);
  const targetRoom = await deps.getRoomById(validated.room_id);
  if (!targetRoom) {
    throw new AppError('존재하지 않는 약속 방입니다.', 404, 'ROOM_NOT_FOUND');
  }
  if (deps.isDemoRoomId(targetRoom.id) && deps.isProduction) {
    throw new AppError('시연 모임방은 읽기 전용입니다.', 403, 'DEMO_READ_ONLY');
  }
  if (targetRoom.status !== 'OPEN') {
    throw new AppError('이미 확정된 모임방에는 투표할 수 없습니다.', 409, 'ROOM_ALREADY_CONFIRMED');
  }
  validateAvailability(targetRoom, validated.availability);

  if (validated.intent === 'update' || Boolean(validated.vote_id)) {
    const existing = await deps.findActiveVoteById(targetRoom.id, validated.vote_id!);
    if (!existing) {
      throw new AppError('수정할 투표를 찾을 수 없습니다.', 404, 'VOTE_NOT_FOUND');
    }
    return performAuthenticatedUpdate(deps, targetRoom, existing, validated, context);
  }

  if (validated.intent === 'create') {
    const matches = await findMatchingActiveVotes(deps, targetRoom.id, validated.nickname);
    if (matches.length > 0) {
      throw buildConflictError(matches[0]);
    }
    return insertNewVote(deps, targetRoom, validated, context);
  }

  // Rolling-deploy fallback for legacy clients omitting intent & vote_id:
  // never overwrite without DB password_hash verification, and block passwordless legacy edits.
  const matches = await findMatchingActiveVotes(deps, targetRoom.id, validated.nickname);
  if (matches.length > 1) {
    throw new VoteConflictError(
      '같은 닉네임의 투표가 여러 개 존재합니다. 다른 닉네임을 사용해 주세요.'
    );
  }
  if (matches.length === 1) {
    return performAuthenticatedUpdate(deps, targetRoom, matches[0], validated, context);
  }
  return insertNewVote(deps, targetRoom, validated, context);
}

export async function deleteVoteWithDeps(
  deps: VoteServiceDeps,
  input: unknown,
  context?: VoteMutationContext
): Promise<{ success: boolean }> {
  const validated = DeleteVoteInputSchema.parse(input);
  const targetRoom = await deps.getRoomById(validated.room_id);
  if (!targetRoom) {
    throw new AppError('존재하지 않는 약속 방입니다.', 404, 'ROOM_NOT_FOUND');
  }
  if (deps.isDemoRoomId(targetRoom.id) && deps.isProduction) {
    throw new AppError('시연 모임방은 읽기 전용입니다.', 403, 'DEMO_READ_ONLY');
  }
  if (targetRoom.status !== 'OPEN') {
    throw new AppError(
      '이미 확정된 모임방의 투표는 삭제할 수 없습니다.',
      409,
      'ROOM_ALREADY_CONFIRMED'
    );
  }

  let existing: Vote | null = null;
  if (validated.vote_id) {
    existing = await deps.findActiveVoteById(targetRoom.id, validated.vote_id);
  } else if (validated.nickname) {
    const matches = await findMatchingActiveVotes(deps, targetRoom.id, validated.nickname);
    if (matches.length > 1) {
      throw new VoteConflictError(
        '같은 닉네임의 투표가 여러 개 존재합니다. 참여자 목록에서 삭제할 투표를 직접 선택해 주세요.'
      );
    }
    existing = matches[0] || null;
  }

  if (!existing) {
    throw new AppError('투표를 찾을 수 없습니다.', 404, 'VOTE_NOT_FOUND');
  }

  if (hasStoredPasswordHash(existing.password_hash)) {
    const lockTarget: PinLockoutTarget = {
      roomId: targetRoom.id,
      voteId: existing.id,
      clientIp: context?.clientIp,
      nickname: existing.nickname,
    };

    await deps.assertVotePinNotLocked(lockTarget);

    const auth = await evaluateVoteMutationAuth({
      action: 'delete',
      password: validated.password,
      storedPasswordHash: existing.password_hash,
    });

    if (!auth.authorized || auth.method !== 'pin') {
      const failure = await deps.recordVotePinFailure(lockTarget);
      throw new AppError(
        `비밀번호(PIN) 숫자 4자리가 일치하지 않습니다. (남은 시도 ${failure.remainingAttempts}회)`,
        403,
        'VOTE_AUTH_FAILED',
        { details: { remaining_attempts: failure.remainingAttempts } }
      );
    }

    await deps.clearVotePinFailuresOnSuccess({
      roomId: targetRoom.id,
      voteId: existing.id,
    });

    const deleted = await deps.softDeleteVote({
      id: existing.id,
      room_id: targetRoom.id,
    });
    if (!deleted) {
      throw new AppError('투표를 찾을 수 없습니다.', 404, 'VOTE_NOT_FOUND');
    }

    await deps.logAuditTrail(
      'VOTE_DELETED',
      existing.id,
      {
        room_id: existing.room_id,
        vote_id: existing.id,
        nickname: existing.nickname,
        authorization: 'pin',
      },
      { ipAddress: context?.clientIp || undefined }
    );

    return { success: true };
  }

  // Legacy passwordless vote (Policy A2): confirmation-only deletion with fail-closed rate limit.
  const legacyAuth = await evaluateVoteMutationAuth({
    action: 'delete',
    password: validated.password,
    storedPasswordHash: existing.password_hash,
  });
  if (!legacyAuth.authorized) {
    throw new AppError(
      '비밀번호가 설정되지 않은 이전 투표입니다. 비밀번호를 비워 두고 삭제해 주세요.',
      400,
      'UNEXPECTED_PIN'
    );
  }

  await deps.assertLegacyMutationAllowed(targetRoom.id, context?.clientIp);

  const deleted = await deps.softDeleteVote({
    id: existing.id,
    room_id: targetRoom.id,
    expectedPasswordHash: existing.password_hash,
    requireEmptyPassword: true,
  });
  if (!deleted) {
    throw new VoteConflictError(
      '투표 상태가 변경되어 삭제할 수 없습니다. 화면을 새로고침한 뒤 다시 시도해 주세요.'
    );
  }

  await deps.logAuditTrail(
    'VOTE_DELETED',
    existing.id,
    {
      room_id: existing.room_id,
      vote_id: existing.id,
      nickname: existing.nickname,
      authorization: 'legacy_no_password',
    },
    { ipAddress: context?.clientIp || undefined }
  );

  return { success: true };
}
