import 'server-only';

import {
  checkRateLimit,
  clearRateLimit,
  peekRateLimit,
} from '@/lib/security/rateLimiter';
import { logAuditTrail } from '@/lib/services/roomService';
import {
  assertVotePinNotLockedWithDeps,
  clearVotePinFailuresOnSuccessWithDeps,
  recordVotePinFailureWithDeps,
  type PinLockoutDeps,
  type PinLockoutTarget,
} from './pinLockoutCore';

const defaultDeps: PinLockoutDeps = {
  checkRateLimit,
  peekRateLimit,
  clearRateLimit,
  logAuditTrail,
};

export type { PinLockoutTarget };

export async function assertVotePinNotLocked(target: PinLockoutTarget): Promise<void> {
  return assertVotePinNotLockedWithDeps(defaultDeps, target);
}

export async function recordVotePinFailure(
  target: PinLockoutTarget
): Promise<{ locked: false; remainingAttempts: number }> {
  return recordVotePinFailureWithDeps(defaultDeps, target);
}

export async function clearVotePinFailuresOnSuccess(target: {
  roomId: string;
  voteId: string;
}): Promise<void> {
  return clearVotePinFailuresOnSuccessWithDeps(defaultDeps, target);
}
