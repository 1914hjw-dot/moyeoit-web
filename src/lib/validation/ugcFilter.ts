/**
 * Moyeoit High-Performance UGC (User Generated Content) Policy & Abuse Filter
 * AdSense & Publisher Policy Compliant Abuse Prevention System
 */

// 1. Abuse & Profanity Term Dictionary (Korean & English Slurs, Adult, Gambling, Hate Speech)
const PROFANITY_PATTERNS = [
  /시발|씨발|썅|개새끼|지랄|존나|졸라|미친놈|미친년|병신|븅신|새끼|좆|씹|바보|멍청이/i,
  /성인|야동|바카라|카지노|토토|조건만남|출장안마|사설토토|릴게임|슬롯머신|음란/i,
  /fuck|shit|bitch|bastard|asshole|cunt|dick|pussy|nigger|retard/i,
];

// 2. PII (Person Identifiable Information) Detection Regex Patterns
const PII_PATTERNS = [
  /\b\d{6}-[1-4]\d{6}\b/, // Korean Resident Registration Number (주민등록번호)
  /\b01[016789][-.\s]?\d{3,4}[-.\s]?\d{4}\b/, // Mobile Phone Number (휴대폰 번호)
  /\b\d{4}[-.\s]?\d{4}[-.\s]?\d{4}[-.\s]?\d{4}\b/, // Credit Card Number (신용카드 번호)
];

// 3. Suspicious URL Spam Pattern
const SPAM_URL_PATTERN = /(https?:\/\/|www\.)[^\s]+\.(xyz|top|click|link|online|site|club|work|monster|buzz|cam|icu)/i;

// 4. Repeated Character Spam Pattern (More than 10 consecutive identical characters)
const REPEATED_CHAR_PATTERN = /(.)\1{10,}/;

export interface UGCValidationResult {
  isValid: boolean;
  sanitizedText: string;
  errorReason?: string;
}

/**
 * Validate and sanitize user-submitted text against AdSense Publisher Policies & UGC Safety Guidelines
 */
export function validateAndSanitizeUGC(text: string, fieldName: string = '입력 내용'): UGCValidationResult {
  if (!text) {
    return { isValid: true, sanitizedText: '' };
  }

  // Step 1. Basic Sanitization (Trim & Control Char Removal)
  let cleaned = text.trim().replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '');

  // Step 2. XSS Tag Stripping & HTML Entity Escaping
  cleaned = cleaned
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '');

  // Step 3. PII Leakage Check
  for (const pattern of PII_PATTERNS) {
    if (pattern.test(cleaned)) {
      return {
        isValid: false,
        sanitizedText: cleaned,
        errorReason: `${fieldName}에 주민등록번호, 전화번호, 카드번호 등 개인정보를 포함할 수 없습니다.`,
      };
    }
  }

  // Step 4. Profanity & Adult/Gambling Term Filter
  for (const pattern of PROFANITY_PATTERNS) {
    if (pattern.test(cleaned)) {
      return {
        isValid: false,
        sanitizedText: cleaned,
        errorReason: `${fieldName}에 부적절한 단어, 비속어 또는 홍보성 키워드가 포함되어 있습니다.`,
      };
    }
  }

  // Step 5. Suspicious URL Spam Filter
  if (SPAM_URL_PATTERN.test(cleaned)) {
    return {
      isValid: false,
      sanitizedText: cleaned,
      errorReason: `${fieldName}에 의심스러운 스팸 URL 링크를 포함할 수 없습니다.`,
    };
  }

  // Step 6. Repeated Character Spam Check
  if (REPEATED_CHAR_PATTERN.test(cleaned)) {
    return {
      isValid: false,
      sanitizedText: cleaned,
      errorReason: `${fieldName}에 동일한 문자를 과도하게 반복하여 입력할 수 없습니다.`,
    };
  }

  return {
    isValid: true,
    sanitizedText: cleaned,
  };
}
