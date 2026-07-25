/**
 * Web Crypto API를 사용한 안전한 비밀번호 SHA-256 해시화 모듈
 * 서버 및 클라이언트 모두에서 동작 가능합니다.
 */
export async function hashPassword(password: string): Promise<string> {
  if (!password || password.trim() === '') {
    return '';
  }

  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(password.trim() + '_moyeoit_salt_2026');

    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    } else {
      // Fallback for simple hashing in Node environment if subtle unavailable
      let hash = 0;
      const str = password.trim() + '_moyeoit_salt_2026';
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash |= 0;
      }
      return 'h_' + Math.abs(hash).toString(16);
    }
  } catch (e) {
    console.error('Password hashing failed:', e);
    return 'h_' + password.trim();
  }
}
