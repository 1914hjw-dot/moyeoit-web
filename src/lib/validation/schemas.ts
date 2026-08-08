import { z } from 'zod';
import { validateAndSanitizeUGC } from './ugcFilter';

function applyUGCFilter(val: string, fieldName: string): string {
  const result = validateAndSanitizeUGC(val, fieldName);
  if (!result.isValid) {
    throw new Error(result.errorReason || `${fieldName}에 허용되지 않는 텍스트가 포함되어 있습니다.`);
  }
  return result.sanitizedText;
}

export const ScheduleTypeSchema = z.enum(['date_only', 'date_time']);

export const DateSelectionModeSchema = z.enum(['RANGE', 'FREE']);

export const AvailabilityStatusSchema = z.enum(['possible', 'impossible', 'maybe']);

export const CreateRoomInputSchema = z
  .object({
    title: z
      .string()
      .transform((val) => applyUGCFilter(val, '모임 제목'))
      .pipe(
        z
          .string()
          .min(1, { message: '모임 제목을 입력해 주세요.' })
          .max(80, { message: '모임 제목은 최대 80자까지 입력 가능합니다.' })
      ),
    description: z
      .string()
      .transform((val) => applyUGCFilter(val, '안내 문구'))
      .pipe(z.string().max(200, { message: '안내 문구는 최대 200자까지 입력 가능합니다.' }))
      .optional()
      .default(''),
    schedule_type: ScheduleTypeSchema.default('date_only'),
    candidate_dates: z
      .array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: '올바른 날짜 형식(YYYY-MM-DD)이어야 합니다.' }))
      .max(60, { message: '후보 날짜는 최대 60개까지 선택 가능합니다.' })
      .optional()
      .default([]),
    time_slots: z
      .array(z.string().transform((val) => applyUGCFilter(val, '시간대')))
      .max(10, { message: '시간대는 최대 10개까지 설정 가능합니다.' })
      .optional()
      .default([]),
    date_selection_mode: DateSelectionModeSchema.default('RANGE'),
  })
  .refine(
    (data) => {
      // In RANGE mode, require at least 1 candidate date.
      // In FREE mode, candidate_dates can be empty on room creation.
      if (data.date_selection_mode === 'RANGE') {
        return data.candidate_dates && data.candidate_dates.length >= 1;
      }
      return true;
    },
    {
      message: '기간 지정 모드에서는 최소 1개 이상의 후보 날짜를 선택해 주세요.',
      path: ['candidate_dates'],
    }
  );

export const ConfirmRoomInputSchema = z.object({
  room_id: z.string().trim().min(1, { message: '올바른 방 번호가 필요합니다.' }),
  confirmed_date: z
    .string()
    .trim()
    .min(1, { message: '확정할 날짜를 선택해 주세요.' })
    .transform((val) => applyUGCFilter(val, '확정 날짜')),
  host_secret: z.string().trim().optional(),
});

export const SubmitVoteInputSchema = z.object({
  room_id: z.string().trim().min(1, { message: '올바른 방 번호가 필요합니다.' }),
  nickname: z
    .string()
    .transform((val) => applyUGCFilter(val, '닉네임'))
    .pipe(
      z
        .string()
        .min(1, { message: '닉네임을 입력해 주세요.' })
        .max(30, { message: '닉네임은 최대 30자까지 입력 가능합니다.' })
    ),
  password: z.string().trim().max(20).optional().default(''),
  vote_token: z.string().trim().optional(),
  availability: z.record(z.string(), AvailabilityStatusSchema),
  note: z
    .string()
    .transform((val) => applyUGCFilter(val, '한줄 메모'))
    .pipe(z.string().max(200, { message: '한줄 메모는 최대 200자까지 입력 가능합니다.' }))
    .optional()
    .default(''),
});

export const DeleteVoteInputSchema = z.object({
  room_id: z.string().trim().min(1, { message: '올바른 방 번호가 필요합니다.' }),
  nickname: z
    .string()
    .transform((val) => applyUGCFilter(val, '닉네임'))
    .pipe(
      z
        .string()
        .min(1, { message: '닉네임을 입력해 주세요.' })
        .max(30, { message: '닉네임은 최대 30자까지 입력 가능합니다.' })
    ),
  password: z.string().trim().max(20).optional().default(''),
  vote_token: z.string().trim().optional(),
});

export type CreateRoomInputZod = z.infer<typeof CreateRoomInputSchema>;
export type ConfirmRoomInputZod = z.infer<typeof ConfirmRoomInputSchema>;
export type SubmitVoteInputZod = z.infer<typeof SubmitVoteInputSchema>;
export type DeleteVoteInputZod = z.infer<typeof DeleteVoteInputSchema>;
