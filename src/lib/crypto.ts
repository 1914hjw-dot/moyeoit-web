const textEncoder = new TextEncoder();
const DEFAULT_LEGACY_PASSWORD_PEPPER = '_moyeoit_secure_salt_v2_2026_x89a3f';
const PASSWORD_HASH_PREFIX = 'pbkdf2-sha256';
const PASSWORD_HASH_ITERATIONS = 310_000;
const CAPABILITY_HASH_PREFIX = 'sha256:';
const LEGACY_SHA256_HEX_REGEX = /^[a-f0-9]{64}$/i;

function getWebCrypto(): Crypto {
  if (!globalThis.crypto?.subtle || !globalThis.crypto.getRandomValues) {
    throw new Error('이 실행 환경에서는 필수 암호화 기능을 사용할 수 없습니다.');
  }
  return globalThis.crypto;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64UrlToBytes(value: string): Uint8Array<ArrayBuffer> {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=');
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

export function timingSafeStringEqual(left: string, right: string): boolean {
  const leftBytes = textEncoder.encode(left);
  const rightBytes = textEncoder.encode(right);
  const maxLength = Math.max(leftBytes.length, rightBytes.length);
  let difference = leftBytes.length ^ rightBytes.length;

  for (let index = 0; index < maxLength; index += 1) {
    difference |= (leftBytes[index] ?? 0) ^ (rightBytes[index] ?? 0);
  }

  return difference === 0;
}

export function generateSecureToken(byteLength: number = 32): string {
  const bytes = new Uint8Array(byteLength);
  getWebCrypto().getRandomValues(bytes);
  return bytesToBase64Url(bytes);
}

async function sha256(value: string): Promise<string> {
  const digest = await getWebCrypto().subtle.digest('SHA-256', textEncoder.encode(value));
  return bytesToHex(new Uint8Array(digest));
}

/** Legacy password digest verification only. New passwords use PBKDF2. */
export async function hashPassword(password: string): Promise<string> {
  if (!password.trim()) return '';
  const pepper = process.env.LEGACY_PASSWORD_PEPPER || DEFAULT_LEGACY_PASSWORD_PEPPER;
  return sha256(password.trim() + pepper);
}

export async function createPasswordHash(password: string): Promise<string> {
  const cleanPassword = password.trim();
  if (!cleanPassword) return '';

  const cryptoApi = getWebCrypto();
  const salt = new Uint8Array(16);
  cryptoApi.getRandomValues(salt);
  const keyMaterial = await cryptoApi.subtle.importKey(
    'raw',
    textEncoder.encode(cleanPassword),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const derivedBits = await cryptoApi.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt,
      iterations: PASSWORD_HASH_ITERATIONS,
    },
    keyMaterial,
    256
  );

  return [
    PASSWORD_HASH_PREFIX,
    PASSWORD_HASH_ITERATIONS.toString(),
    bytesToBase64Url(salt),
    bytesToBase64Url(new Uint8Array(derivedBits)),
  ].join('$');
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const cleanPassword = password.trim();
  if (!cleanPassword || !storedHash) return false;

  if (!storedHash.startsWith(`${PASSWORD_HASH_PREFIX}$`)) {
    if (!LEGACY_SHA256_HEX_REGEX.test(storedHash)) return false;
    return timingSafeStringEqual(await hashPassword(cleanPassword), storedHash.toLowerCase());
  }

  const [prefix, iterationText, saltText, expectedText] = storedHash.split('$');
  const iterations = Number(iterationText);
  if (
    prefix !== PASSWORD_HASH_PREFIX ||
    !Number.isInteger(iterations) ||
    iterations < 100_000 ||
    iterations > 1_000_000 ||
    !saltText ||
    !expectedText
  ) {
    return false;
  }

  try {
    const cryptoApi = getWebCrypto();
    const keyMaterial = await cryptoApi.subtle.importKey(
      'raw',
      textEncoder.encode(cleanPassword),
      'PBKDF2',
      false,
      ['deriveBits']
    );
    const derivedBits = await cryptoApi.subtle.deriveBits(
      {
        name: 'PBKDF2',
        hash: 'SHA-256',
        salt: base64UrlToBytes(saltText),
        iterations,
      },
      keyMaterial,
      256
    );
    return timingSafeStringEqual(bytesToBase64Url(new Uint8Array(derivedBits)), expectedText);
  } catch {
    return false;
  }
}

export function hasStoredPasswordHash(storedHash?: string | null): boolean {
  return Boolean((storedHash || '').trim());
}

export function needsPasswordHashRehash(storedHash?: string | null): boolean {
  const cleanHash = (storedHash || '').trim();
  if (!cleanHash) return false;

  const parts = cleanHash.split('$');
  if (parts.length !== 4) return true;

  const [prefix, iterationText, saltText, expectedText] = parts;
  return (
    prefix !== PASSWORD_HASH_PREFIX ||
    iterationText !== PASSWORD_HASH_ITERATIONS.toString() ||
    !saltText ||
    !expectedText
  );
}

export async function verifyVoteOwnership(params: {
  password?: string;
  storedPasswordHash?: string | null;
}): Promise<{
  authorized: boolean;
  method: 'pin' | 'none';
  reason?: 'INVALID_PIN' | 'MISSING_OWNERSHIP';
}> {
  const cleanHash = (params.storedPasswordHash || '').trim();
  const cleanPassword = (params.password || '').trim();

  if (!cleanHash) {
    return { authorized: false, method: 'none', reason: 'MISSING_OWNERSHIP' };
  }

  if (!cleanPassword) {
    return { authorized: false, method: 'none', reason: 'INVALID_PIN' };
  }

  const isMatch = await verifyPassword(cleanPassword, cleanHash);
  if (!isMatch) {
    return { authorized: false, method: 'none', reason: 'INVALID_PIN' };
  }

  return { authorized: true, method: 'pin' };
}

export async function hashCapabilityToken(token: string): Promise<string> {
  return `${CAPABILITY_HASH_PREFIX}${await sha256(token)}`;
}

export async function verifyCapabilityToken(token: string, storedValue: string): Promise<boolean> {
  if (!token || !storedValue || !storedValue.startsWith(CAPABILITY_HASH_PREFIX)) {
    return false;
  }

  return timingSafeStringEqual(await hashCapabilityToken(token), storedValue);
}

export function sanitizeInput(input: string, maxLength: number = 200): string {
  if (!input) return '';

  let sanitized = input
    .replace(/[\0\x08\x0B\x0C\x0E-\x1F]/g, '')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');

  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized.trim();
}
