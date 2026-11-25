import { isSameNickname } from '../validation/nickname.ts';

export interface VoterHint {
  voteId?: string;
  nickname?: string;
}

const LAST_VOTER_KEY_PREFIX = 'moyeoit_last_voter_';
const LEGACY_VOTED_KEY_PREFIX = 'moyeoit_voted_';
const LEGACY_VOTE_TOKEN_PREFIX = 'moyeoit_vote_token_';

function resolveStorage(storage?: Pick<Storage, 'getItem' | 'setItem' | 'removeItem' | 'length' | 'key'> | null) {
  if (storage !== undefined) return storage;
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function parseHintValue(raw: string): VoterHint | null {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === 'object') {
      const candidate = parsed as { voteId?: unknown; nickname?: unknown };
      const voteId = typeof candidate.voteId === 'string' && candidate.voteId.trim() ? candidate.voteId.trim() : undefined;
      const nickname =
        typeof candidate.nickname === 'string' && candidate.nickname.trim()
          ? candidate.nickname.trim()
          : undefined;
      if (voteId || nickname) {
        return { voteId, nickname };
      }
    }
  } catch {
    // Ignore malformed JSON hints
  }
  return null;
}

/**
 * Reads the non-authoritative UX hint for which participant was last viewed/submitted
 * on this browser. Never used for authentication or authorization.
 */
export function getLastVoterHint(
  identifiers: string[],
  storage?: Pick<Storage, 'getItem' | 'setItem' | 'removeItem' | 'length' | 'key'> | null
): VoterHint | null {
  const store = resolveStorage(storage);
  if (!store) return null;

  try {
    for (const identifier of identifiers) {
      if (!identifier) continue;
      const raw = store.getItem(`${LAST_VOTER_KEY_PREFIX}${identifier}`);
      if (raw) {
        const parsed = parseHintValue(raw);
        if (parsed) return parsed;
      }
    }

    for (const identifier of identifiers) {
      if (!identifier) continue;
      const legacyNickname = store.getItem(`${LEGACY_VOTED_KEY_PREFIX}${identifier}`);
      if (legacyNickname && legacyNickname.trim()) {
        return { nickname: legacyNickname.trim() };
      }
    }
  } catch {
    return null;
  }

  return null;
}

export function saveLastVoterHint(
  identifiers: string[],
  vote: { id: string; nickname: string },
  storage?: Pick<Storage, 'getItem' | 'setItem' | 'removeItem' | 'length' | 'key'> | null
): void {
  const store = resolveStorage(storage);
  if (!store) return;

  const payload = JSON.stringify({ voteId: vote.id, nickname: vote.nickname });
  try {
    for (const identifier of identifiers) {
      if (!identifier) continue;
      store.setItem(`${LAST_VOTER_KEY_PREFIX}${identifier}`, payload);
      store.removeItem(`${LEGACY_VOTED_KEY_PREFIX}${identifier}`);
    }
  } catch {
    // Ignore quota or storage errors
  }
}

export function clearLastVoterHint(
  identifiers: string[],
  storage?: Pick<Storage, 'getItem' | 'setItem' | 'removeItem' | 'length' | 'key'> | null
): void {
  const store = resolveStorage(storage);
  if (!store) return;

  try {
    for (const identifier of identifiers) {
      if (!identifier) continue;
      store.removeItem(`${LAST_VOTER_KEY_PREFIX}${identifier}`);
      store.removeItem(`${LEGACY_VOTED_KEY_PREFIX}${identifier}`);
    }
  } catch {
    // Ignore storage errors
  }
}

/**
 * Removes legacy client-cached vote tokens so client storage no longer retains
 * obsolete auth artifacts.
 */
export function purgeLegacyVoteTokens(
  identifiers: string[],
  storage?: Pick<Storage, 'getItem' | 'setItem' | 'removeItem' | 'length' | 'key'> | null
): void {
  const store = resolveStorage(storage);
  if (!store) return;

  const prefixes = identifiers
    .filter(Boolean)
    .map((identifier) => `${LEGACY_VOTE_TOKEN_PREFIX}${identifier}_`);
  if (prefixes.length === 0) return;

  try {
    const keysToRemove: string[] = [];
    for (let index = 0; index < store.length; index += 1) {
      const key = store.key(index);
      if (key && prefixes.some((prefix) => key.startsWith(prefix))) {
        keysToRemove.push(key);
      }
    }
    for (const key of keysToRemove) {
      store.removeItem(key);
    }
  } catch {
    // Ignore storage errors
  }
}

export function findHintedVote<T extends { id: string; nickname: string }>(
  votes: T[],
  hint: VoterHint | null
): T | null {
  if (!hint || votes.length === 0) return null;

  if (hint.voteId) {
    const byId = votes.find((vote) => vote.id === hint.voteId);
    if (byId) return byId;
  }

  if (hint.nickname) {
    const byNickname = votes.find((vote) => isSameNickname(vote.nickname, hint.nickname!));
    if (byNickname) return byNickname;
  }

  return null;
}
