import { containsUrlOrDomain, validateAndSanitizeUGC } from './ugcFilter.ts';

export const OG_TITLE_MAX_LENGTH = 80;
export const DEFAULT_OG_TITLE = '약속 날짜 조율하기';
export const DEFAULT_OG_TYPE = '모여잇 • 약속 날짜 조율';

export const ALLOWED_OG_TYPES = new Set([
  '모여잇 • 약속 날짜 조율',
  '모여잇 • 가이드',
  '모여잇 • 일정 확정',
]);

export function resolveOgType(rawType: string | null | undefined): string {
  const trimmed = rawType?.trim() || '';
  return ALLOWED_OG_TYPES.has(trimmed) ? trimmed : DEFAULT_OG_TYPE;
}

export function validateOgQueryTitle(rawTitle: string | null | undefined):
  | { ok: true; title: string }
  | { ok: false; reason: string } {
  if (!rawTitle || !rawTitle.trim()) {
    return { ok: true, title: DEFAULT_OG_TITLE };
  }

  const trimmed = rawTitle.trim();
  if (trimmed.length > OG_TITLE_MAX_LENGTH) {
    return { ok: false, reason: '제목은 최대 80자까지 허용됩니다.' };
  }

  if (containsUrlOrDomain(trimmed)) {
    return { ok: false, reason: '제목에 URL이나 도메인을 포함할 수 없습니다.' };
  }

  const ugc = validateAndSanitizeUGC(trimmed, '제목');
  if (!ugc.isValid) {
    return { ok: false, reason: ugc.errorReason || '허용되지 않는 텍스트가 포함되어 있습니다.' };
  }

  return { ok: true, title: ugc.sanitizedText || DEFAULT_OG_TITLE };
}
