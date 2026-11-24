import { AppError } from '../errors.ts';
import {
  createRateLimitKey,
  type RateLimitOptions,
  type RateLimitResult,
} from './rateLimiterCore.ts';

export interface PinLockoutTier {
  scope: string;
  maxFailures: number;
  windowMs: number;
  label: string;
}

export const PIN_LOCKOUT_TIERS: readonly PinLockoutTier[] = [
  { scope: 'vote-pin-fail-15m', maxFailures: 5, windowMs: 15 * 60_000, label: '15분' },
  { scope: 'vote-pin-fail-1h', maxFailures: 10, windowMs: 60 * 60_000, label: '1시간' },
  { scope: 'vote-pin-fail-24h', maxFailures: 15, windowMs: 24 * 60 * 60_000, label: '24시간' },
];

/**
 * Room-scoped IP spraying protection.
 * Scoped per (roomId, clientIp) with 20 failures / 15m so shared Wi-Fi users in
 * cafes/schools/offices do not falsely trigger lockouts across rooms or normal retries.
 */
export const IP_PIN_LOCKOUT_TIER: PinLockoutTier = {
  scope: 'vote-pin-ip-fail-15m',
  maxFailures: 20,
  windowMs: 15 * 60_000,
  label: '15분',
};

export interface PinLockoutTarget {
  roomId: string;
  voteId: string;
  clientIp?: string | null;
  nickname?: string;
}

export interface PinLockoutDeps {
  checkRateLimit: (
    key: string,
    maxAttempts: number,
    windowMs?: number,
    options?: RateLimitOptions
  ) => Promise<RateLimitResult>;
  peekRateLimit: (
    key: string,
    maxAttempts: number,
    windowMs?: number,
    options?: RateLimitOptions
  ) => Promise<RateLimitResult>;
  clearRateLimit: (key: string, windowMs?: number) => Promise<void>;
  logAuditTrail: (
    eventType: string,
    targetId: string,
    payload?: Record<string, unknown>
  ) => Promise<void>;
}

function normalizeVoteLockKey(roomId: string, voteId: string): string {
  return `${roomId.trim()}:${voteId.trim()}`;
}

function normalizeIpLockKey(roomId: string, clientIp?: string | null): string | null {
  const cleanIp = (clientIp || '').trim();
  if (!cleanIp || cleanIp === 'unknown') return null;
  return `${roomId.trim()}:${cleanIp}`;
}

function throwRateLimitUnavailable(): never {
  throw new AppError(
    '보안 확인 서비스를 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도해 주세요.',
    503,
    'RATE_LIMIT_UNAVAILABLE'
  );
}

function throwPinLocked(resetTimeSeconds: number): never {
  const retryAfterSeconds = Math.max(1, Math.ceil(resetTimeSeconds));
  const remainingMinutes = Math.max(1, Math.ceil(retryAfterSeconds / 60));
  throw new AppError(
    `비밀번호(PIN) 입력 실패가 누적되어 약 ${remainingMinutes}분 동안 잠겼습니다. 잠시 후 다시 시도해 주세요.`,
    429,
    'VOTE_PIN_LOCKED',
    { retryAfterSeconds }
  );
}

export async function assertVotePinNotLockedWithDeps(
  deps: PinLockoutDeps,
  target: PinLockoutTarget
): Promise<void> {
  const voteKey = normalizeVoteLockKey(target.roomId, target.voteId);
  const ipKey = normalizeIpLockKey(target.roomId, target.clientIp);

  if (ipKey) {
    const ipStatus = await deps.peekRateLimit(
      createRateLimitKey(IP_PIN_LOCKOUT_TIER.scope, ipKey),
      IP_PIN_LOCKOUT_TIER.maxFailures - 1,
      IP_PIN_LOCKOUT_TIER.windowMs,
      { failClosed: true }
    );
    if (ipStatus.backendUnavailable) throwRateLimitUnavailable();
    if (!ipStatus.allowed) throwPinLocked(ipStatus.resetTimeSeconds);
  }

  for (let index = PIN_LOCKOUT_TIERS.length - 1; index >= 0; index -= 1) {
    const tier = PIN_LOCKOUT_TIERS[index];
    const status = await deps.peekRateLimit(
      createRateLimitKey(tier.scope, voteKey),
      tier.maxFailures - 1,
      tier.windowMs,
      { failClosed: true }
    );
    if (status.backendUnavailable) throwRateLimitUnavailable();
    if (!status.allowed) throwPinLocked(status.resetTimeSeconds);
  }

  const burst = await deps.checkRateLimit(
    createRateLimitKey('vote-auth', voteKey),
    10,
    60_000,
    { failClosed: true }
  );
  if (burst.backendUnavailable) throwRateLimitUnavailable();
  if (!burst.allowed) {
    throw new AppError(
      '소유권 확인 요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.',
      429,
      'RATE_LIMITED',
      { retryAfterSeconds: burst.resetTimeSeconds }
    );
  }
}

export async function recordVotePinFailureWithDeps(
  deps: PinLockoutDeps,
  target: PinLockoutTarget
): Promise<{ locked: false; remainingAttempts: number }> {
  const voteKey = normalizeVoteLockKey(target.roomId, target.voteId);
  const ipKey = normalizeIpLockKey(target.roomId, target.clientIp);

  let lockedNow = false;
  let ipLockedNow = false;
  let maxLockResetSeconds = 0;
  const remainingCandidates: number[] = [];

  for (const tier of PIN_LOCKOUT_TIERS) {
    const result = await deps.checkRateLimit(
      createRateLimitKey(tier.scope, voteKey),
      tier.maxFailures - 1,
      tier.windowMs,
      { failClosed: true }
    );
    if (result.backendUnavailable) throwRateLimitUnavailable();
    if (!result.allowed) {
      lockedNow = true;
      maxLockResetSeconds = Math.max(maxLockResetSeconds, result.resetTimeSeconds);
    } else {
      remainingCandidates.push(result.remaining + 1);
    }
  }

  if (ipKey) {
    const ipResult = await deps.checkRateLimit(
      createRateLimitKey(IP_PIN_LOCKOUT_TIER.scope, ipKey),
      IP_PIN_LOCKOUT_TIER.maxFailures - 1,
      IP_PIN_LOCKOUT_TIER.windowMs,
      { failClosed: true }
    );
    if (ipResult.backendUnavailable) throwRateLimitUnavailable();
    if (!ipResult.allowed) {
      lockedNow = true;
      ipLockedNow = true;
      maxLockResetSeconds = Math.max(maxLockResetSeconds, ipResult.resetTimeSeconds);
    } else {
      remainingCandidates.push(ipResult.remaining + 1);
    }
  }

  await deps.logAuditTrail('VOTE_AUTH_FAILED', target.roomId, {
    vote_id: target.voteId,
    nickname: target.nickname || null,
    locked: lockedNow,
    ip_locked: ipLockedNow,
  });

  if (lockedNow) {
    const retryAfterSeconds = Math.max(1, Math.ceil(maxLockResetSeconds));
    const remainingMinutes = Math.max(1, Math.ceil(retryAfterSeconds / 60));
    throw new AppError(
      `비밀번호(PIN) 입력 실패 횟수가 초과되어 약 ${remainingMinutes}분 동안 잠겼습니다. 잠시 후 다시 시도해 주세요.`,
      429,
      'VOTE_PIN_LOCKED',
      { retryAfterSeconds }
    );
  }

  return {
    locked: false,
    remainingAttempts:
      remainingCandidates.length > 0 ? Math.max(1, Math.min(...remainingCandidates)) : 1,
  };
}

export async function clearVotePinFailuresOnSuccessWithDeps(
  deps: PinLockoutDeps,
  target: { roomId: string; voteId: string }
): Promise<void> {
  const voteKey = normalizeVoteLockKey(target.roomId, target.voteId);
  const shortTermTier = PIN_LOCKOUT_TIERS[0];
  await deps.clearRateLimit(
    createRateLimitKey(shortTermTier.scope, voteKey),
    shortTermTier.windowMs
  );
  await deps.clearRateLimit(createRateLimitKey('vote-auth', voteKey), 60_000);
}
