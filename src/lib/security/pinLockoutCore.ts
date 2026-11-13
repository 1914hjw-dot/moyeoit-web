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

function normalizePinTargetKey(roomId: string, nickname: string): string {
  return `${roomId.trim()}:${nickname.trim().toLocaleLowerCase('ko-KR')}`;
}

export async function assertVotePinNotLockedWithDeps(
  deps: PinLockoutDeps,
  roomId: string,
  nickname: string
): Promise<void> {
  const targetKey = normalizePinTargetKey(roomId, nickname);

  for (let index = PIN_LOCKOUT_TIERS.length - 1; index >= 0; index -= 1) {
    const tier = PIN_LOCKOUT_TIERS[index];
    const status = await deps.peekRateLimit(
      createRateLimitKey(tier.scope, targetKey),
      tier.maxFailures - 1,
      tier.windowMs,
      { failClosed: true }
    );
    if (status.backendUnavailable) {
      throw new AppError(
        '보안 확인 서비스를 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도해 주세요.',
        503,
        'RATE_LIMIT_UNAVAILABLE'
      );
    }
    if (!status.allowed) {
      const remainingMinutes = Math.max(1, Math.ceil(status.resetTimeSeconds / 60));
      throw new AppError(
        `비밀번호(PIN) 입력 실패가 누적되어 약 ${remainingMinutes}분 동안 잠겼습니다. 잠시 후 다시 시도해 주세요.`,
        429,
        'VOTE_PIN_LOCKED'
      );
    }
  }

  const burst = await deps.checkRateLimit(
    createRateLimitKey('vote-auth', targetKey),
    10,
    60_000,
    { failClosed: true }
  );
  if (burst.backendUnavailable) {
    throw new AppError(
      '보안 확인 서비스를 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도해 주세요.',
      503,
      'RATE_LIMIT_UNAVAILABLE'
    );
  }
  if (!burst.allowed) {
    throw new AppError(
      '소유권 확인 요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.',
      429,
      'RATE_LIMITED'
    );
  }
}

export async function recordVotePinFailureWithDeps(
  deps: PinLockoutDeps,
  roomId: string,
  nickname: string
): Promise<void> {
  const targetKey = normalizePinTargetKey(roomId, nickname);
  let lockedNow = false;

  for (const tier of PIN_LOCKOUT_TIERS) {
    const result = await deps.checkRateLimit(
      createRateLimitKey(tier.scope, targetKey),
      tier.maxFailures - 1,
      tier.windowMs,
      { failClosed: true }
    );
    if (result.backendUnavailable) {
      throw new AppError(
        '보안 확인 서비스를 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도해 주세요.',
        503,
        'RATE_LIMIT_UNAVAILABLE'
      );
    }
    if (!result.allowed) {
      lockedNow = true;
    }
  }

  await deps.logAuditTrail('VOTE_AUTH_FAILED', roomId, {
    nickname,
    locked: lockedNow,
  });

  if (lockedNow) {
    throw new AppError(
      '비밀번호(PIN) 입력 실패 횟수가 초과되어 일시적으로 잠겼습니다. 잠시 후 다시 시도해 주세요.',
      429,
      'VOTE_PIN_LOCKED'
    );
  }
}

export async function clearVotePinFailuresOnSuccessWithDeps(
  deps: PinLockoutDeps,
  roomId: string,
  nickname: string
): Promise<void> {
  const targetKey = normalizePinTargetKey(roomId, nickname);
  const shortTermTier = PIN_LOCKOUT_TIERS[0];
  await deps.clearRateLimit(
    createRateLimitKey(shortTermTier.scope, targetKey),
    shortTermTier.windowMs
  );
  await deps.clearRateLimit(createRateLimitKey('vote-auth', targetKey), 60_000);
}
