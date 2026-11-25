/**
 * Canonicalizes a nickname for storage and display by applying Unicode NFC
 * normalization and trimming surrounding whitespace.
 */
export function canonicalizeNickname(value: string): string {
  return value.normalize('NFC').trim();
}

/**
 * Normalizes a nickname for case-insensitive and Unicode-equivalence comparisons.
 * Matches SQL `lower(btrim(normalize(nickname, NFC)))`.
 */
export function normalizeNickname(value: string): string {
  return canonicalizeNickname(value).toLocaleLowerCase('ko-KR');
}

/**
 * Returns true if two nicknames refer to the same canonicalized/normalized name.
 */
export function isSameNickname(left: string, right: string): boolean {
  return normalizeNickname(left) === normalizeNickname(right);
}
