import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import test from 'node:test';
import type { Room, Vote } from '../src/types/schema.ts';
import {
  clearLastVoterHint,
  findHintedVote,
  getLastVoterHint,
  purgeLegacyVoteTokens,
  saveLastVoterHint,
} from '../src/lib/client/voterHintStorage.ts';
import {
  createPasswordHash,
  hashPassword,
  verifyPassword,
} from '../src/lib/crypto.ts';
import { AppError } from '../src/lib/errors.ts';
import {
  assertVotePinNotLockedWithDeps,
  clearVotePinFailuresOnSuccessWithDeps,
  IP_PIN_LOCKOUT_TIER,
  recordVotePinFailureWithDeps,
  type PinLockoutDeps,
} from '../src/lib/security/pinLockoutCore.ts';
import {
  checkRateLimitWithBackend,
  clearMemoryRateLimitStore,
  clearRateLimitWithBackend,
  createRateLimitKey,
  isSensitiveScope,
  peekRateLimitWithBackend,
} from '../src/lib/security/rateLimiterCore.ts';
import { evaluateVoteMutationAuth } from '../src/lib/security/voteAuth.ts';
import {
  deleteVoteWithDeps,
  submitVoteWithDeps,
  toPublicVote,
  VoteConflictError,
  type VoteServiceDeps,
} from '../src/lib/services/voteServiceCore.ts';
import {
  canonicalizeNickname,
  isSameNickname,
  normalizeNickname,
} from '../src/lib/validation/nickname.ts';
import {
  DeleteVoteInputSchema,
  SubmitVoteInputSchema,
} from '../src/lib/validation/schemas.ts';

function createPinLockoutDeps(auditLog: Array<{ eventType: string; payload?: Record<string, unknown> }>): PinLockoutDeps {
  return {
    checkRateLimit: (key, maxAttempts, windowMs) =>
      checkRateLimitWithBackend(null, key, maxAttempts, windowMs, { failClosed: false }),
    peekRateLimit: (key, maxAttempts, windowMs) =>
      peekRateLimitWithBackend(null, key, maxAttempts, windowMs, { failClosed: false }),
    clearRateLimit: (key, windowMs) => clearRateLimitWithBackend(null, key, windowMs),
    logAuditTrail: async (eventType, _targetId, payload) => {
      auditLog.push({ eventType, payload });
    },
  };
}

function createMemoryVoteEnv(options?: { roomStatus?: 'OPEN' | 'CONFIRMED' }) {
  clearMemoryRateLimitStore();
  const auditLog: Array<{ eventType: string; targetId: string; payload?: Record<string, unknown> }> = [];
  const lockoutDeps = createPinLockoutDeps(auditLog);

  const room: Room = {
    id: '22222222-2222-4222-8222-222222222222',
    legacy_slug: 'moyeoit-testroom',
    title: '주말 모임',
    schedule_type: 'date_only',
    candidate_dates: ['2026-12-01', '2026-12-02'],
    time_slots: [],
    status: options?.roomStatus ?? 'OPEN',
    date_selection_mode: 'RANGE',
    created_at: new Date().toISOString(),
  };

  const votes: Vote[] = [];

  const deps: VoteServiceDeps = {
    isProduction: true,
    getRoomById: async (id) => (id === room.id || id === room.legacy_slug ? room : null),
    isDemoRoomId: () => false,
    findActiveVoteById: async (roomId, voteId) =>
      votes.find((v) => v.room_id === roomId && v.id === voteId && !v.deleted_at) || null,
    findActiveVotesByRoom: async (roomId) =>
      votes.filter((v) => v.room_id === roomId && !v.deleted_at),
    insertVote: async (record) => {
      const collision = votes.some(
        (v) =>
          v.room_id === record.room_id &&
          !v.deleted_at &&
          isSameNickname(v.nickname, record.nickname)
      );
      if (collision) return { conflict: true };
      const now = new Date().toISOString();
      const created: Vote = {
        id: crypto.randomUUID(),
        room_id: record.room_id,
        vote_token: crypto.randomUUID(),
        nickname: record.nickname,
        password_hash: record.password_hash,
        availability: record.availability,
        note: record.note,
        created_at: now,
        updated_at: now,
        deleted_at: null,
      };
      votes.push(created);
      return { vote: created };
    },
    updateVote: async (params) => {
      const target = votes.find(
        (v) => v.id === params.id && v.room_id === params.room_id && !v.deleted_at
      );
      if (!target) return null;
      target.password_hash = params.password_hash;
      target.availability = params.availability;
      target.note = params.note;
      target.updated_at = new Date().toISOString();
      return target;
    },
    softDeleteVote: async (params) => {
      const target = votes.find(
        (v) => v.id === params.id && v.room_id === params.room_id && !v.deleted_at
      );
      if (!target) return false;
      if (params.requireEmptyPassword && (target.password_hash || '').trim() !== '') {
        return false;
      }
      target.deleted_at = new Date().toISOString();
      return true;
    },
    assertVotePinNotLocked: (target) => assertVotePinNotLockedWithDeps(lockoutDeps, target),
    recordVotePinFailure: (target) => recordVotePinFailureWithDeps(lockoutDeps, target),
    clearVotePinFailuresOnSuccess: (target) =>
      clearVotePinFailuresOnSuccessWithDeps(lockoutDeps, target),
    assertLegacyMutationAllowed: async (roomId, clientIp) => {
      const cleanIp = (clientIp || '').trim() || 'unknown';
      const limit = await checkRateLimitWithBackend(
        null,
        createRateLimitKey('vote-legacy-mutation', `${roomId}:${cleanIp}`),
        5,
        10 * 60_000,
        { failClosed: false }
      );
      if (!limit.allowed) {
        throw new AppError('요청이 너무 많습니다.', 429, 'RATE_LIMITED', {
          retryAfterSeconds: limit.resetTimeSeconds,
        });
      }
    },
    logAuditTrail: async (eventType, targetId, payload) => {
      auditLog.push({ eventType, targetId, payload });
    },
  };

  return { room, votes, deps, auditLog };
}

test('nickname normalization unifies NFC/NFD Hangul, whitespace, and casing', () => {
  const nfc = '민수'.normalize('NFC');
  const nfd = '민수'.normalize('NFD');
  assert.notEqual(nfc, nfd);
  assert.equal(canonicalizeNickname(`  ${nfd}  `), nfc);
  assert.equal(isSameNickname(nfc, ` ${nfd} `), true);
  assert.equal(normalizeNickname('  Alice '), 'alice');
  assert.equal(isSameNickname('Alice', 'aLiCe'), true);
});

test('evaluateVoteMutationAuth enforces Policy A2 and detects legacy SHA-256 rehash', async () => {
  const pbkdf2Hash = await createPasswordHash('2468');
  const legacySha256 = await hashPassword('7391');

  assert.deepEqual(
    await evaluateVoteMutationAuth({
      action: 'update',
      password: '2468',
      storedPasswordHash: pbkdf2Hash,
    }),
    { authorized: true, method: 'pin', needsRehash: false }
  );

  assert.deepEqual(
    await evaluateVoteMutationAuth({
      action: 'update',
      password: '7391',
      storedPasswordHash: legacySha256,
    }),
    { authorized: true, method: 'pin', needsRehash: true }
  );

  assert.deepEqual(
    await evaluateVoteMutationAuth({
      action: 'delete',
      password: '0000',
      storedPasswordHash: pbkdf2Hash,
    }),
    { authorized: false, method: 'none', reason: 'INVALID_PIN' }
  );

  assert.deepEqual(
    await evaluateVoteMutationAuth({
      action: 'update',
      password: '1234',
      storedPasswordHash: '',
    }),
    { authorized: false, method: 'none', reason: 'LEGACY_EDIT_DISABLED' }
  );

  assert.deepEqual(
    await evaluateVoteMutationAuth({
      action: 'delete',
      password: '',
      storedPasswordHash: null,
    }),
    { authorized: true, method: 'legacy_no_password', needsRehash: false }
  );

  assert.deepEqual(
    await evaluateVoteMutationAuth({
      action: 'delete',
      password: '1234',
      storedPasswordHash: '   ',
    }),
    { authorized: false, method: 'none', reason: 'UNEXPECTED_PIN' }
  );
});

test('sensitive rate limit prefixes include write, room-scoped IP PIN lockout, and legacy mutation', () => {
  assert.equal(isSensitiveScope('vote-write:abc'), true);
  assert.equal(isSensitiveScope('vote-pin-ip-fail-15m:abc'), true);
  assert.equal(isSensitiveScope('vote-legacy-mutation:abc'), true);
});

test('room-scoped IP lockout blocks spraying at 20 failures without affecting other rooms or clearing on single success', async () => {
  clearMemoryRateLimitStore();
  const auditLog: Array<{ eventType: string; payload?: Record<string, unknown> }> = [];
  const deps = createPinLockoutDeps(auditLog);
  const attackerIp = '198.51.100.77';

  for (let i = 0; i < IP_PIN_LOCKOUT_TIER.maxFailures - 1; i += 1) {
    const target = {
      roomId: 'room-A',
      voteId: `00000000-0000-4000-8000-${String(i).padStart(12, '0')}`,
      clientIp: attackerIp,
    };
    await assertVotePinNotLockedWithDeps(deps, target);
    const failInfo = await recordVotePinFailureWithDeps(deps, target);
    assert.equal(failInfo.locked, false);
  }

  // A single user's PIN success must NOT reset the room-scoped IP spray bucket.
  await clearVotePinFailuresOnSuccessWithDeps(deps, {
    roomId: 'room-A',
    voteId: '00000000-0000-4000-8000-000000000001',
  });

  // 20th failure in room-A from attackerIp locks the IP for room-A.
  await assert.rejects(
    () =>
      recordVotePinFailureWithDeps(deps, {
        roomId: 'room-A',
        voteId: '00000000-0000-4000-8000-000000000099',
        clientIp: attackerIp,
      }),
    (error: unknown) =>
      error instanceof AppError &&
      error.status === 429 &&
      error.code === 'VOTE_PIN_LOCKED' &&
      typeof error.retryAfterSeconds === 'number' &&
      error.retryAfterSeconds > 0
  );

  // Subsequent request on another vote in room-A is blocked immediately.
  await assert.rejects(
    () =>
      assertVotePinNotLockedWithDeps(deps, {
        roomId: 'room-A',
        voteId: '00000000-0000-4000-8000-000000000100',
        clientIp: attackerIp,
      }),
    (error: unknown) => error instanceof AppError && error.code === 'VOTE_PIN_LOCKED'
  );

  // Same IP on a different room (shared Wi-Fi scenario) is NOT blocked.
  await assertVotePinNotLockedWithDeps(deps, {
    roomId: 'room-B',
    voteId: '00000000-0000-4000-8000-000000000100',
    clientIp: attackerIp,
  });
});

test('multi-device edit, shared-device voting, and conflict detection without lock pollution', async () => {
  const { room, votes, deps } = createMemoryVoteEnv();

  // Device A creates vote for 민수
  const createdA = await submitVoteWithDeps(
    deps,
    {
      room_id: room.id,
      intent: 'create',
      nickname: '민수'.normalize('NFD'),
      password: '2468',
      availability: { '2026-12-01': 'possible' },
      note: '첫 메모',
    },
    { clientIp: '203.0.113.1' }
  );

  assert.equal(createdA.nickname, '민수'.normalize('NFC'));
  assert.equal(createdA.has_password, true);
  assert.equal('vote_token' in createdA, false);
  assert.equal('password_hash' in createdA, false);

  // Shared device creates a separate vote for 지현
  const createdB = await submitVoteWithDeps(
    deps,
    {
      room_id: room.id,
      intent: 'create',
      nickname: '지현',
      password: '1357',
      availability: { '2026-12-02': 'possible' },
      note: '',
    },
    { clientIp: '203.0.113.1' }
  );
  assert.equal(votes.filter((v) => !v.deleted_at).length, 2);
  assert.notEqual(createdA.id, createdB.id);

  // Another device tries to create duplicate 민수 (NFC) -> 409 conflict without incrementing PIN failures
  for (let attempt = 0; attempt < 6; attempt += 1) {
    await assert.rejects(
      () =>
        submitVoteWithDeps(
          deps,
          {
            room_id: room.id,
            intent: 'create',
            nickname: '민수',
            password: '9999',
            availability: { '2026-12-02': 'possible' },
          },
          { clientIp: '203.0.113.2' }
        ),
      (error: unknown) =>
        error instanceof VoteConflictError &&
        error.status === 409 &&
        error.code === 'VOTE_CONFLICT' &&
        error.details?.existing_vote_id === createdA.id
    );
  }

  // Device B edits 민수's vote by vote_id + DB PIN (even with wrong/arbitrary vote_token, or none)
  const updatedA = await submitVoteWithDeps(
    deps,
    {
      room_id: room.id,
      intent: 'update',
      vote_id: createdA.id,
      nickname: '민수',
      password: '2468',
      vote_token: 'arbitrary-ignored-token',
      availability: { '2026-12-02': 'maybe' },
      note: '수정됨',
    },
    { clientIp: '203.0.113.99' }
  );

  assert.equal(updatedA.id, createdA.id);
  assert.deepEqual(updatedA.availability, { '2026-12-02': 'maybe' });
  assert.equal(updatedA.note, '수정됨');
});

test('cache bypass via vote_token is blocked and rolling-deploy legacy requests require DB password', async () => {
  const { room, votes, deps } = createMemoryVoteEnv();
  const shaHash = await hashPassword('7391');

  const protectedVote: Vote = {
    id: crypto.randomUUID(),
    room_id: room.id,
    vote_token: 'secret-db-token',
    nickname: '영희',
    password_hash: shaHash,
    availability: { '2026-12-01': 'possible' },
    note: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null,
  };
  const passwordlessVote: Vote = {
    id: crypto.randomUUID(),
    room_id: room.id,
    vote_token: 'legacy-token-123',
    nickname: '철수',
    password_hash: '',
    availability: { '2026-12-01': 'possible' },
    note: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null,
  };
  votes.push(protectedVote, passwordlessVote);

  // Rolling-deploy request omitting intent & vote_id with matching vote_token but wrong PIN -> 403
  await assert.rejects(
    () =>
      submitVoteWithDeps(
        deps,
        {
          room_id: room.id,
          nickname: '영희',
          password: '0000',
          vote_token: 'secret-db-token',
          availability: { '2026-12-02': 'possible' },
        },
        { clientIp: '198.51.100.10' }
      ),
    (error: unknown) =>
      error instanceof AppError &&
      error.status === 403 &&
      error.code === 'VOTE_AUTH_FAILED' &&
      error.details?.remaining_attempts === 4
  );

  // Rolling-deploy request omitting intent & vote_id targeting passwordless vote -> 403 LEGACY_VOTE_EDIT_DISABLED
  await assert.rejects(
    () =>
      submitVoteWithDeps(
        deps,
        {
          room_id: room.id,
          nickname: '철수',
          password: '1234',
          vote_token: 'legacy-token-123',
          availability: { '2026-12-02': 'possible' },
        },
        { clientIp: '198.51.100.10' }
      ),
    (error: unknown) =>
      error instanceof AppError && error.status === 403 && error.code === 'LEGACY_VOTE_EDIT_DISABLED'
  );

  // Rolling-deploy request with valid legacy SHA-256 PIN upgrades password hash to PBKDF2
  await submitVoteWithDeps(
    deps,
    {
      room_id: room.id,
      nickname: '영희',
      password: '7391',
      availability: { '2026-12-02': 'possible' },
    },
    { clientIp: '198.51.100.10' }
  );
  assert.match(protectedVote.password_hash || '', /^pbkdf2-sha256\$310000\$/);
  assert.equal(await verifyPassword('7391', protectedVote.password_hash || ''), true);
});

test('Policy A2 legacy passwordless vote: edit blocked, delete allowed via confirmation, soft-deleted nickname reusable', async () => {
  const { room, votes, deps, auditLog } = createMemoryVoteEnv();

  const legacyVote: Vote = {
    id: crypto.randomUUID(),
    room_id: room.id,
    vote_token: 'old-token',
    nickname: '레거시유저',
    password_hash: '   ',
    availability: { '2026-12-01': 'possible' },
    note: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null,
  };
  votes.push(legacyVote);

  assert.equal(toPublicVote(legacyVote).has_password, false);

  await assert.rejects(
    () =>
      submitVoteWithDeps(
        deps,
        {
          room_id: room.id,
          intent: 'update',
          vote_id: legacyVote.id,
          nickname: '레거시유저',
          password: '1234',
          availability: { '2026-12-02': 'possible' },
        },
        { clientIp: '192.0.2.5' }
      ),
    (error: unknown) =>
      error instanceof AppError && error.status === 403 && error.code === 'LEGACY_VOTE_EDIT_DISABLED'
  );

  await assert.rejects(
    () =>
      deleteVoteWithDeps(
        deps,
        {
          room_id: room.id,
          vote_id: legacyVote.id,
          password: '1234',
        },
        { clientIp: '192.0.2.5' }
      ),
    (error: unknown) =>
      error instanceof AppError && error.status === 400 && error.code === 'UNEXPECTED_PIN'
  );

  // Delete from a completely different device (no token, empty password) succeeds
  const deleteResult = await deleteVoteWithDeps(
    deps,
    {
      room_id: room.id,
      vote_id: legacyVote.id,
      password: '',
    },
    { clientIp: '192.0.2.99' }
  );
  assert.deepEqual(deleteResult, { success: true });
  assert.ok(legacyVote.deleted_at);
  assert.equal(auditLog.at(-1)?.payload?.authorization, 'legacy_no_password');

  // Re-create vote with the same nickname and a new 4-digit PIN
  const recreated = await submitVoteWithDeps(
    deps,
    {
      room_id: room.id,
      intent: 'create',
      nickname: '레거시유저',
      password: '5678',
      availability: { '2026-12-02': 'possible' },
    },
    { clientIp: '192.0.2.99' }
  );
  assert.equal(recreated.has_password, true);
  assert.notEqual(recreated.id, legacyVote.id);
});

test('confirmed room rejects both vote submissions and deletions', async () => {
  const { room, votes, deps } = createMemoryVoteEnv({ roomStatus: 'CONFIRMED' });
  const voteId = crypto.randomUUID();
  votes.push({
    id: voteId,
    room_id: room.id,
    nickname: '민수',
    password_hash: await createPasswordHash('1234'),
    availability: { '2026-12-01': 'possible' },
    note: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null,
  });

  await assert.rejects(
    () =>
      submitVoteWithDeps(deps, {
        room_id: room.id,
        intent: 'create',
        nickname: '새유저',
        password: '1234',
        availability: { '2026-12-01': 'possible' },
      }),
    (error: unknown) =>
      error instanceof AppError && error.status === 409 && error.code === 'ROOM_ALREADY_CONFIRMED'
  );

  await assert.rejects(
    () =>
      deleteVoteWithDeps(deps, {
        room_id: room.id,
        vote_id: voteId,
        password: '1234',
      }),
    (error: unknown) =>
      error instanceof AppError && error.status === 409 && error.code === 'ROOM_ALREADY_CONFIRMED'
  );
});

test('Zod schemas enforce intent/vote_id invariants and canonicalize nicknames', () => {
  const validCreate = SubmitVoteInputSchema.parse({
    room_id: 'room-1',
    intent: 'create',
    nickname: `  ${'민수'.normalize('NFD')}  `,
    password: '1234',
    availability: { '2026-12-01': 'possible' },
  });
  assert.equal(validCreate.nickname, '민수'.normalize('NFC'));

  const updateMissingId = SubmitVoteInputSchema.safeParse({
    room_id: 'room-1',
    intent: 'update',
    nickname: '민수',
    password: '1234',
    availability: { '2026-12-01': 'possible' },
  });
  assert.equal(updateMissingId.success, false);

  const createWithId = SubmitVoteInputSchema.safeParse({
    room_id: 'room-1',
    intent: 'create',
    vote_id: '11111111-1111-4111-8111-111111111111',
    nickname: '민수',
    password: '1234',
    availability: { '2026-12-01': 'possible' },
  });
  assert.equal(createWithId.success, false);

  const deleteByIdOnly = DeleteVoteInputSchema.safeParse({
    room_id: 'room-1',
    vote_id: '11111111-1111-4111-8111-111111111111',
    nickname: '',
    password: '',
  });
  assert.equal(deleteByIdOnly.success, true);

  const deleteMissingTarget = DeleteVoteInputSchema.safeParse({
    room_id: 'room-1',
    nickname: '   ',
    password: '',
  });
  assert.equal(deleteMissingTarget.success, false);
});

test('voterHintStorage isolates UX hints and purges legacy vote tokens', () => {
  const map = new Map<string, string>();
  const fakeStorage: Pick<Storage, 'getItem' | 'setItem' | 'removeItem' | 'length' | 'key'> = {
    get length() {
      return map.size;
    },
    key(index: number) {
      return Array.from(map.keys())[index] ?? null;
    },
    getItem(key: string) {
      return map.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      map.set(key, value);
    },
    removeItem(key: string) {
      map.delete(key);
    },
  };

  fakeStorage.setItem('moyeoit_vote_token_room-1_민수', 'stale-token-1');
  fakeStorage.setItem('moyeoit_vote_token_slug-1_민수', 'stale-token-2');
  fakeStorage.setItem('unrelated_key', 'keep-me');

  purgeLegacyVoteTokens(['room-1', 'slug-1'], fakeStorage);
  assert.equal(fakeStorage.getItem('moyeoit_vote_token_room-1_민수'), null);
  assert.equal(fakeStorage.getItem('moyeoit_vote_token_slug-1_민수'), null);
  assert.equal(fakeStorage.getItem('unrelated_key'), 'keep-me');

  saveLastVoterHint(['room-1', 'slug-1'], { id: 'vote-1', nickname: '민수' }, fakeStorage);
  const hint = getLastVoterHint(['room-1'], fakeStorage);
  assert.deepEqual(hint, { voteId: 'vote-1', nickname: '민수' });

  const matched = findHintedVote(
    [
      { id: 'vote-1', nickname: '민수' },
      { id: 'vote-2', nickname: '지현' },
    ],
    hint
  );
  assert.equal(matched?.id, 'vote-1');

  clearLastVoterHint(['room-1', 'slug-1'], fakeStorage);
  assert.equal(getLastVoterHint(['room-1', 'slug-1'], fakeStorage), null);
});
