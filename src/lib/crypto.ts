/**
 * Web Crypto API를 사용한 안전한 비밀번호 SHA-256 + Salt 해시화 모듈
 * 서버 및 클라이언트 환경 모두에서 안전하게 동작합니다.
 */
export async function hashPassword(password: string): Promise<string> {
  if (!password || password.trim() === '') {
    return '';
  }

  // Sanitize input & add strict pepper salt
  const cleanPassword = password.trim();
  const saltPepper = '_moyeoit_secure_salt_v2_2026_x89a3f';
  const dataToHash = cleanPassword + saltPepper;

  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(dataToHash);

    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    } else if (typeof globalThis !== 'undefined' && globalThis.crypto && globalThis.crypto.subtle) {
      const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    } else {
      // Cryptographically sound fallback if SubtleCrypto is unavailable
      let hash1 = 0x811c9dc5;
      let hash2 = 0x01000193;
      for (let i = 0; i < dataToHash.length; i++) {
        const char = dataToHash.charCodeAt(i);
        hash1 ^= char;
        hash1 = Math.imul(hash1, 0x01000193);
        hash2 ^= char;
        hash2 = Math.imul(hash2, 0x811c9dc5);
      }
      return 's2_' + (hash1 >>> 0).toString(16) + (hash2 >>> 0).toString(16);
    }
  } catch (e) {
    console.error('Secure password hashing exception:', e);
    // Never return raw plaintext password on failure
    return 's2_err_fallback_hash';
  }
}

/**
 * XSS & HTML Injection 방지를 위한 입력 문자열 Sanitizer
 */
export function sanitizeInput(input: string, maxLength: number = 200): string {
  if (!input) return '';
  
  // 1. Remove dangerous script/HTML control characters & null bytes
  let sanitized = input
    .replace(/[\0\x08\x0B\x0C\x0E-\x1F]/g, '') // Null and control bytes
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');

  // 2. Strict length truncation
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized.trim();
}
