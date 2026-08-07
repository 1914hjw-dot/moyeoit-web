import { z } from 'zod';

// XSS Sanitization Helper (Strip dangerous HTML tags & script injections)
function sanitizeText(val: string): string {
  if (!val) return '';
  return val
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/[<>]/g, (match) => (match === '<' ? '&lt;' : '&gt;'));
}

export const ScheduleTypeSchema = z.enum(['date_only', 'date_time']);

export const AvailabilityStatusSchema = z.enum(['possible', 'impossible', 'maybe']);

export const CreateRoomInputSchema = z.object({
  title: z
    .string()
    .transform(sanitizeText)
    .pipe(
      z
        .string()
        .min(1, { message: '모임 제목을 입력해 주세요.' })
        .max(80, { message: '모임 제목은 최대 80자까지 입력 가능합니다.' })
    ),
  description: z
    .string()
    .transform(sanitizeText)
    .pipe(z.string().max(200, { message: '안내 문구는 최대 200자까지 입력 가능합니다.' }))
    .optional()
    .default(''),
  schedule_type: ScheduleTypeSchema.default('date_only'),
  candidate_dates: z
    .array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: '올바른 날짜 형식(YYYY-MM-DD)이어야 합니다.' }))
    .min(1, { message: '최소 1개 이상의 후보 날짜를 선택해 주세요.' })
    .max(31, { message: '후보 날짜는 최대 31개까지 선택 가능합니다.' }),
  time_slots: z
    .array(z.string().transform(sanitizeText))
    .max(10, { message: '시간대는 최대 10개까지 설정 가능합니다.' })
    .optional()
    .default([]),
});

export const SubmitVoteInputSchema = z.object({
  room_id: z.string().trim().min(1, { message: '올바른 방 번호가 필요합니다.' }),
  nickname: z
    .string()
    .transform(sanitizeText)
    .pipe(
      z
        .string()
        .min(1, { message: '닉네임을 입력해 주세요.' })
        .max(30, { message: '닉네임은 최대 30자까지 입력 가능합니다.' })
    ),
  password: z.string().trim().max(20).optional().default(''),
  availability: z.record(z.string(), AvailabilityStatusSchema),
  note: z
    .string()
    .transform(sanitizeText)
    .pipe(z.string().max(200, { message: '한줄 메모는 최대 200자까지 입력 가능합니다.' }))
    .optional()
    .default(''),
});

export const DeleteVoteInputSchema = z.object({
  room_id: z.string().trim().min(1, { message: '올바른 방 번호가 필요합니다.' }),
  nickname: z
    .string()
    .transform(sanitizeText)
    .pipe(
      z
        .string()
        .min(1, { message: '닉네임을 입력해 주세요.' })
        .max(30, { message: '닉네임은 최대 30자까지 입력 가능합니다.' })
    ),
  password: z.string().trim().max(20).optional().default(''),
});

export type CreateRoomInputZod = z.infer<typeof CreateRoomInputSchema>;
export type SubmitVoteInputZod = z.infer<typeof SubmitVoteInputSchema>;
export type DeleteVoteInputZod = z.infer<typeof DeleteVoteInputSchema>;
