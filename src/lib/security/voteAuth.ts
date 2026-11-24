import {
  hasStoredPasswordHash,
  needsPasswordHashRehash,
  verifyPassword,
} from '../crypto.ts';

export type VoteAuthAction = 'update' | 'delete';

export type VoteMutationAuthResult =
  | {
      authorized: true;
      method: 'pin';
      needsRehash: boolean;
    }
  | {
      authorized: true;
      method: 'legacy_no_password';
      needsRehash: false;
    }
  | {
      authorized: false;
      method: 'none';
      reason: 'INVALID_PIN' | 'LEGACY_EDIT_DISABLED' | 'UNEXPECTED_PIN';
    };

/**
 * Authorizes a vote mutation strictly from database credentials (password_hash).
 * Never trusts client-cached tokens (such as localStorage vote_token).
 *
 * Legacy Policy A2:
 * - Votes with a stored password hash require a matching 4-digit PIN for both update and delete.
 * - Legacy votes without a password hash cannot be updated (delete and re-vote instead),
 *   and can be deleted without a PIN.
 */
export async function evaluateVoteMutationAuth(params: {
  action: VoteAuthAction;
  password?: string;
  storedPasswordHash?: string | null;
}): Promise<VoteMutationAuthResult> {
  if (hasStoredPasswordHash(params.storedPasswordHash)) {
    const cleanPassword = (params.password || '').trim();
    if (!cleanPassword) {
      return { authorized: false, method: 'none', reason: 'INVALID_PIN' };
    }

    const storedHash = params.storedPasswordHash!.trim();
    const isMatch = await verifyPassword(cleanPassword, storedHash);
    if (!isMatch) {
      return { authorized: false, method: 'none', reason: 'INVALID_PIN' };
    }

    return {
      authorized: true,
      method: 'pin',
      needsRehash: needsPasswordHashRehash(storedHash),
    };
  }

  if (params.action === 'update') {
    return {
      authorized: false,
      method: 'none',
      reason: 'LEGACY_EDIT_DISABLED',
    };
  }

  const cleanPassword = (params.password || '').trim();
  if (cleanPassword !== '') {
    return {
      authorized: false,
      method: 'none',
      reason: 'UNEXPECTED_PIN',
    };
  }

  return {
    authorized: true,
    method: 'legacy_no_password',
    needsRehash: false,
  };
}
