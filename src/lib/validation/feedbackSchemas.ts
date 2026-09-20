import { z } from 'zod';

export const FEEDBACK_CATEGORIES = [
  '일정/투표',
  '방 생성/참여',
  '공유 링크',
  '화면/사용성',
  '오류 신고',
  '광고',
  '기타',
] as const;

export type FeedbackCategory = (typeof FEEDBACK_CATEGORIES)[number];

export const FEEDBACK_STATUSES = [
  'NEW',
  'READ',
  'IN_PROGRESS',
  'RESOLVED',
] as const;

export type FeedbackStatus = (typeof FEEDBACK_STATUSES)[number];

/**
 * Sanitize user feedback content by trimming and stripping non-printable control characters.
 * Does NOT strip HTML tags or code snippets (e.g. <script>, <div>) so that technical bug reports,
 * stack traces, and error logs are fully preserved in their original form.
 * Safe rendering is guaranteed by React's default text escaping (no dangerouslySetInnerHTML).
 */
export function sanitizeFeedbackContent(text: string): string {
  if (!text) return '';
  return text
    .trim()
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '');
}

export const FeedbackCategorySchema = z.enum(FEEDBACK_CATEGORIES, {
  message: '올바른 문의 유형을 선택해 주세요.',
});

export const FeedbackStatusSchema = z.enum(FEEDBACK_STATUSES, {
  message: '올바른 상태값을 선택해 주세요.',
});

export const CreateFeedbackSchema = z.object({
  category: FeedbackCategorySchema,
  content: z
    .string()
    .transform((val) => sanitizeFeedbackContent(val))
    .pipe(
      z
        .string()
        .min(1, { message: '문의 내용을 입력해 주세요.' })
        .max(2000, { message: '문의 내용은 최대 2,000자까지 입력 가능합니다.' })
    ),
  reply_email: z
    .string()
    .trim()
    .max(255, { message: '이메일 주소가 너무 깁니다.' })
    .optional()
    .refine(
      (val) => {
        if (!val || val.length === 0) return true;
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
      },
      { message: '올바른 이메일 주소를 입력해 주세요.' }
    ),
  page_path: z.string().trim().max(255).optional().default(''),
});

export const UpdateFeedbackStatusSchema = z.object({
  status: FeedbackStatusSchema,
});

export const CreateNoticeSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { message: '공지 제목을 입력해 주세요.' })
    .max(150, { message: '공지 제목은 최대 150자까지 입력 가능합니다.' }),
  content: z
    .string()
    .trim()
    .min(1, { message: '공지 내용을 입력해 주세요.' }),
  is_pinned: z.boolean().optional().default(false),
  is_published: z.boolean().optional().default(false),
});

export const UpdateNoticeSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { message: '공지 제목을 입력해 주세요.' })
    .max(150, { message: '공지 제목은 최대 150자까지 입력 가능합니다.' })
    .optional(),
  content: z
    .string()
    .trim()
    .min(1, { message: '공지 내용을 입력해 주세요.' })
    .optional(),
  is_pinned: z.boolean().optional(),
  is_published: z.boolean().optional(),
});

export type CreateFeedbackInputZod = z.infer<typeof CreateFeedbackSchema>;
export type UpdateFeedbackStatusInputZod = z.infer<typeof UpdateFeedbackStatusSchema>;
export type CreateNoticeInputZod = z.infer<typeof CreateNoticeSchema>;
export type UpdateNoticeInputZod = z.infer<typeof UpdateNoticeSchema>;
