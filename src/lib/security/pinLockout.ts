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
} from './pinLockoutCore';

const defaultDeps: PinLockoutDeps = {
  checkRateLimit,
  peekRateLimit,
  clearRateLimit,
  logAuditTrail,
};

export async function assertVotePinNotLocked(roomId: string, nickname: string): Promise<void> {
  return assertVotePinNotLockedWithDeps(defaultDeps, roomId, nickname);
}

export async function recordVotePinFailure(roomId: string, nickname: string): Promise<void> {
  return recordVotePinFailureWithDeps(defaultDeps, roomId, nickname);
}

export async function clearVotePinFailuresOnSuccess(
  roomId: string,
  nickname: string
): Promise<void> {
  return clearVotePinFailuresOnSuccessWithDeps(defaultDeps, roomId, nickname);
}
