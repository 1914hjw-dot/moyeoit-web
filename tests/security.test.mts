import assert from 'node:assert/strict';
import test from 'node:test';
import { ZodError } from 'zod';
import {
  createPasswordHash,
  generateSecureToken,
  hashCapabilityToken,
  hashPassword,
  timingSafeStringEqual,
  verifyCapabilityToken,
  verifyPassword,
  verifyVoteOwnership,
} from '../src/lib/crypto.ts';
import { AppError } from '../src/lib/errors.ts';
import {
  checkSameOrigin,
  parseJsonBodyWithLimit,
} from '../src/lib/http/requestSecurity.ts';
import {
  assertVotePinNotLockedWithDeps,
  clearVotePinFailuresOnSuccessWithDeps,
  recordVotePinFailureWithDeps,
  type PinLockoutDeps,
} from '../src/lib/security/pinLockoutCore.ts';
import {
  checkRateLimitWithBackend,
  clearMemoryRateLimitStore,
  clearRateLimitWithBackend,
  createRateLimitKey,
  peekRateLimitWithBackend,
  type RateLimitSupabaseClient,
} from '../src/lib/security/rateLimiterCore.ts';
import { resolveOgType, validateOgQueryTitle } from '../src/lib/validation/ogValidation.ts';
import { CreateRoomInputSchema, SubmitVoteInputSchema } from '../src/lib/validation/schemas.ts';

test('capability tokens are random and reject unhashed legacy values', async () => {
  const firstToken = generateSecureToken();
  const secondToken = generateSecureToken();
  assert.notEqual(firstToken, secondToken);
  assert.ok(firstToken.length >= 40);

  const digest = await hashCapabilityToken(firstToken);
  assert.match(digest, /^sha256:[a-f0-9]{64}$/);
  assert.equal(digest.includes(firstToken), false);
  assert.equal(await verifyCapabilityToken(firstToken, digest), true);
  assert.equal(await verifyCapabilityToken(secondToken, digest), false);
  assert.equal(await verifyCapabilityToken('legacy-secret', 'legacy-secret'), false);
});

test('new PIN hashes use salted PBKDF2 and reject incorrect or malformed values', async () => {
  const firstHash = await createPasswordHash('4821');
  const secondHash = await createPasswordHash('4821');
  assert.match(firstHash, /^pbkdf2-sha256\$310000\$/);
  assert.notEqual(firstHash, secondHash);
  assert.equal(await verifyPassword('4821', firstHash), true);
  assert.equal(await verifyPassword('0000', firstHash), false);
  assert.equal(await verifyPassword('4821', 'not-a-valid-hash'), false);
});

test('constant-time string comparison handles equal and unequal lengths', () => {
  assert.equal(timingSafeStringEqual('same-value', 'same-value'), true);
  assert.equal(timingSafeStringEqual('same-value', 'different'), false);
  assert.equal(timingSafeStringEqual('short', 'shorter'), false);
});

test('PIN-protected votes require a valid 4-digit PIN even when vote_token matches', async () => {
  const passwordHash = await createPasswordHash('4821');
  const storedToken = 'cached-device-token';

  assert.deepEqual(
    await verifyVoteOwnership({
      password: '',
      storedPasswordHash: passwordHash,
      voteToken: storedToken,
      storedVoteToken: storedToken,
    }),
    { authorized: false, method: 'none', reason: 'INVALID_PIN' }
  );

  assert.deepEqual(
    await verifyVoteOwnership({
      password: '????',
      storedPasswordHash: passwordHash,
      voteToken: storedToken,
      storedVoteToken: storedToken,
    }),
    { authorized: false, method: 'none', reason: 'INVALID_PIN' }
  );

  assert.deepEqual(
    await verifyVoteOwnership({
      password: '0000',
      storedPasswordHash: passwordHash,
      voteToken: storedToken,
      storedVoteToken: storedToken,
    }),
    { authorized: false, method: 'none', reason: 'INVALID_PIN' }
  );

  assert.deepEqual(
    await verifyVoteOwnership({
      password: '4821',
      storedPasswordHash: passwordHash,
      voteToken: '',
      storedVoteToken: storedToken,
    }),
    { authorized: true, method: 'pin' }
  );
});

test('legacy votes without PIN allow matching vote_token only when no invalid password is given', async () => {
  const storedToken = 'legacy-device-token';

  assert.deepEqual(
    await verifyVoteOwnership({
      password: '????',
      storedPasswordHash: '',
      voteToken: storedToken,
      storedVoteToken: storedToken,
    }),
    { authorized: false, method: 'none', reason: 'INVALID_PIN' }
  );

  assert.deepEqual(
    await verifyVoteOwnership({
      password: '',
      storedPasswordHash: '',
      voteToken: 'wrong-token',
      storedVoteToken: storedToken,
    }),
    { authorized: false, method: 'none', reason: 'MISSING_OWNERSHIP' }
  );

  assert.deepEqual(
    await verifyVoteOwnership({
      password: '',
      storedPasswordHash: '',
      voteToken: storedToken,
      storedVoteToken: storedToken,
    }),
    { authorized: true, method: 'legacy_token' }
  );

  assert.deepEqual(
    await verifyVoteOwnership({
      password: '1234',
      storedPasswordHash: '',
      voteToken: storedToken,
      storedVoteToken: storedToken,
      allowLegacyPinUpgrade: true,
    }),
    { authorized: true, method: 'legacy_token' }
  );
});

test('legacy SHA-256 PIN hashes in existing DB still verify without vote_token and reject wrong PINs', async () => {
  const legacyHash = await hashPassword('7391');
  const storedToken = 'cached-device-token';

  assert.deepEqual(
    await verifyVoteOwnership({
      password: '',
      storedPasswordHash: legacyHash,
      voteToken: storedToken,
      storedVoteToken: storedToken,
    }),
    { authorized: false, method: 'none', reason: 'INVALID_PIN' }
  );

  assert.deepEqual(
    await verifyVoteOwnership({
      password: '7391',
      storedPasswordHash: legacyHash,
      voteToken: '',
      storedVoteToken: storedToken,
    }),
    { authorized: true, method: 'pin' }
  );
});

test('sensitive rate limit scopes fail closed when distributed backend fails', async () => {
  clearMemoryRateLimitStore();
  const failingSupabase: RateLimitSupabaseClient = {
    rpc: async () => ({ data: null, error: { message: 'connection refused' } }),
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({ data: null, error: { message: 'connection refused' } }),
        }),
      }),
      delete: () => ({
        eq: async () => ({ error: { message: 'connection refused' } }),
      }),
    }),
  };

  const sensitiveResult = await checkRateLimitWithBackend(
    failingSupabase,
    createRateLimitKey('vote-auth', 'room-1:alice'),
    5,
    60_000
  );
  assert.equal(sensitiveResult.allowed, false);
  assert.equal(sensitiveResult.backendUnavailable, true);

  const nonSensitiveResult = await checkRateLimitWithBackend(
    failingSupabase,
    createRateLimitKey('room-read', '127.0.0.1'),
    5,
    60_000
  );
  assert.equal(nonSensitiveResult.allowed, true);
  assert.equal(nonSensitiveResult.backendUnavailable, undefined);
});

test('vote PIN progressive lockout blocks on 5th failure and clears short-term bucket on success', async () => {
  clearMemoryRateLimitStore();
  const auditEvents: string[] = [];

  const deps: PinLockoutDeps = {
    checkRateLimit: (key, maxAttempts, windowMs) =>
      checkRateLimitWithBackend(null, key, maxAttempts, windowMs, { failClosed: false }),
    peekRateLimit: (key, maxAttempts, windowMs) =>
      peekRateLimitWithBackend(null, key, maxAttempts, windowMs, { failClosed: false }),
    clearRateLimit: (key, windowMs) => clearRateLimitWithBackend(null, key, windowMs),
    logAuditTrail: async (eventType) => {
      auditEvents.push(eventType);
    },
  };

  for (let i = 0; i < 4; i += 1) {
    await assertVotePinNotLockedWithDeps(deps, 'room-lock', 'minsu');
    await recordVotePinFailureWithDeps(deps, 'room-lock', 'minsu');
  }

  await assertVotePinNotLockedWithDeps(deps, 'room-lock', 'minsu');

  await assert.rejects(
    () => recordVotePinFailureWithDeps(deps, 'room-lock', 'minsu'),
    (error: unknown) =>
      error instanceof AppError && error.status === 429 && error.code === 'VOTE_PIN_LOCKED'
  );

  await assert.rejects(
    () => assertVotePinNotLockedWithDeps(deps, 'room-lock', 'minsu'),
    (error: unknown) =>
      error instanceof AppError && error.status === 429 && error.code === 'VOTE_PIN_LOCKED'
  );

  assert.equal(auditEvents.length, 5);

  await clearVotePinFailuresOnSuccessWithDeps(deps, 'room-lock', 'minsu');
  await assertVotePinNotLockedWithDeps(deps, 'room-lock', 'minsu');
});

test('UGC validation returns ZodError (400) instead of throwing Error and avoids false positives', () => {
  const validLegit = CreateRoomInputSchema.safeParse({
    title: '성인식 및 Dickens 북클럽 바보 모임',
    description: '일반 모임 안내입니다.',
    schedule_type: 'date_only',
    candidate_dates: ['2026-12-01'],
    date_selection_mode: 'RANGE',
  });
  assert.equal(validLegit.success, true);

  const profanityRoom = CreateRoomInputSchema.safeParse({
    title: '시발 모임',
    description: '',
    schedule_type: 'date_only',
    candidate_dates: ['2026-12-01'],
    date_selection_mode: 'RANGE',
  });
  assert.equal(profanityRoom.success, false);
  if (!profanityRoom.success) {
    assert.ok(profanityRoom.error instanceof ZodError);
    assert.match(profanityRoom.error.issues[0]?.message || '', /부적절한 단어/);
  }

  const englishSlurVote = SubmitVoteInputSchema.safeParse({
    room_id: 'room-1',
    nickname: 'fuck this',
    password: '1234',
    availability: { '2026-12-01': 'possible' },
  });
  assert.equal(englishSlurVote.success, false);
});

test('OG query validation enforces length, URL blocking, UGC filtering, and type whitelist', () => {
  assert.equal(resolveOgType('모여잇 • 가이드'), '모여잇 • 가이드');
  assert.equal(resolveOgType('임의의 피싱 타입'), '모여잇 • 약속 날짜 조율');

  assert.equal(validateOgQueryTitle('친구들 송년회 날짜 정하기').ok, true);
  assert.equal(validateOgQueryTitle('a'.repeat(81)).ok, false);
  assert.equal(validateOgQueryTitle('https://phishing.example.com 로그인').ok, false);
  assert.equal(validateOgQueryTitle('010-1234-5678 연락처').ok, false);
});

test('request security checks Origin safely and enforces byte limit even without Content-Length', async () => {
  const headers = new Headers({
    origin: 'https://evil.example',
    host: 'moyeoit-web.vercel.app',
    'x-forwarded-host': 'evil.example',
  });
  assert.equal(checkSameOrigin(headers).ok, false);

  const oversizedBody = JSON.stringify({ title: 'a'.repeat(70 * 1024) });
  const chunkedRequest = new Request('https://moyeoit-web.vercel.app/api/rooms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: oversizedBody,
  });

  await assert.rejects(
    () => parseJsonBodyWithLimit(chunkedRequest),
    (error: unknown) =>
      error instanceof AppError && error.status === 413 && error.code === 'PAYLOAD_TOO_LARGE'
  );

  const invalidJsonRequest = new Request('https://moyeoit-web.vercel.app/api/rooms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{broken-json',
  });

  await assert.rejects(
    () => parseJsonBodyWithLimit(invalidJsonRequest),
    (error: unknown) =>
      error instanceof AppError && error.status === 400 && error.code === 'INVALID_JSON'
  );
});
