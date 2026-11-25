import { z } from 'zod';
import { canonicalizeNickname } from './nickname.ts';
import { validateAndSanitizeUGC } from './ugcFilter.ts';

function ugcFilteredString(fieldName: string) {
  return z.string().transform((val, ctx) => {
    const result = validateAndSanitizeUGC(val, fieldName);
    if (!result.isValid) {
      ctx.addIssue({
        code: 'custom',
        message: result.errorReason || `${fieldName}에 허용되지 않는 텍스트가 포함되어 있습니다.`,
      });
      return z.NEVER;
    }
    return result.sanitizedText;
  });
}

function isValidDateString(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

const RoomIdSchema = z.string().trim().min(1, { message: '올바른 방 번호가 필요합니다.' }).max(100);
const VoteIdSchema = z.string().trim().uuid({ message: '올바른 투표 식별자가 아닙니다.' });
const NicknameSchema = ugcFilteredString('닉네임')
  .transform((val) => canonicalizeNickname(val))
  .pipe(
    z
      .string()
      .min(1, { message: '닉네임을 입력해 주세요.' })
      .max(30, { message: '닉네임은 최대 30자까지 입력 가능합니다.' })
  );

export const ScheduleTypeSchema = z.enum(['date_only', 'date_time']);

export const DateSelectionModeSchema = z.enum(['RANGE', 'FREE']);

export const AvailabilityStatusSchema = z.enum(['possible', 'impossible', 'maybe']);

export const CreateRoomInputSchema = z
  .object({
    title: ugcFilteredString('모임 제목').pipe(
      z
        .string()
        .min(1, { message: '모임 제목을 입력해 주세요.' })
        .max(80, { message: '모임 제목은 최대 80자까지 입력 가능합니다.' })
    ),
    description: ugcFilteredString('안내 문구')
      .pipe(z.string().max(200, { message: '안내 문구는 최대 200자까지 입력 가능합니다.' }))
      .optional()
      .default(''),
    schedule_type: ScheduleTypeSchema.default('date_only'),
    candidate_dates: z
      .array(
        z.string().refine(isValidDateString, {
          message: '실제로 존재하는 날짜(YYYY-MM-DD)를 입력해 주세요.',
        })
      )
      .max(60, { message: '후보 날짜는 최대 60개까지 선택 가능합니다.' })
      .refine((dates) => new Set(dates).size === dates.length, {
        message: '후보 날짜는 중복해서 등록할 수 없습니다.',
      })
      .optional()
      .default([]),
    time_slots: z
      .array(ugcFilteredString('시간대').pipe(z.string().min(1).max(50)))
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
  room_id: RoomIdSchema,
  confirmed_date: z
    .string()
    .trim()
    .min(1, { message: '확정할 날짜를 선택해 주세요.' })
    .pipe(ugcFilteredString('확정 날짜'))
    .pipe(z.string().max(100, { message: '확정 날짜 값이 너무 깁니다.' })),
  host_secret: z.string().trim().max(200).optional().default(''),
});

export const SubmitVoteInputSchema = z
  .object({
    room_id: RoomIdSchema,
    intent: z.enum(['create', 'update']).optional(),
    vote_id: VoteIdSchema.optional(),
    nickname: NicknameSchema,
    password: z
      .string()
      .trim()
      .regex(/^\d{4}$/, { message: '수정·삭제용 비밀번호는 숫자 4자리로 입력해 주세요.' }),
    // Accepted for rolling-deploy backward compatibility; ignored by server auth.
    vote_token: z.string().trim().max(100).optional().default(''),
    availability: z
      .record(z.string().max(100), AvailabilityStatusSchema)
      .refine((availability) => Object.keys(availability).length <= 600, {
        message: '한 번에 등록할 수 있는 응답 항목이 너무 많습니다.',
      }),
    note: ugcFilteredString('한줄 메모')
      .pipe(z.string().max(200, { message: '한줄 메모는 최대 200자까지 입력 가능합니다.' }))
      .optional()
      .default(''),
  })
  .superRefine((data, ctx) => {
    if (data.intent === 'update' && !data.vote_id) {
      ctx.addIssue({
        code: 'custom',
        message: '수정할 투표 식별자가 필요합니다.',
        path: ['vote_id'],
      });
    }
    if (data.intent === 'create' && data.vote_id) {
      ctx.addIssue({
        code: 'custom',
        message: '신규 투표에는 투표 식별자를 지정할 수 없습니다.',
        path: ['vote_id'],
      });
    }
  });

export const DeleteVoteInputSchema = z
  .object({
    room_id: RoomIdSchema,
    vote_id: VoteIdSchema.optional(),
    nickname: z.preprocess(
      (val) => (typeof val === 'string' && val.trim() === '' ? undefined : val),
      NicknameSchema.optional()
    ),
    password: z
      .string()
      .trim()
      .refine((val) => val === '' || /^\d{4}$/.test(val), {
        message: '비밀번호는 숫자 4자리로 입력해 주세요.',
      })
      .optional()
      .default(''),
    // Accepted for rolling-deploy backward compatibility; ignored by server auth.
    vote_token: z.string().trim().max(100).optional().default(''),
  })
  .superRefine((data, ctx) => {
    if (!data.vote_id && !data.nickname) {
      ctx.addIssue({
        code: 'custom',
        message: '삭제할 투표를 선택하거나 닉네임을 입력해 주세요.',
        path: ['nickname'],
      });
    }
  });

export type CreateRoomInputZod = z.infer<typeof CreateRoomInputSchema>;
export type ConfirmRoomInputZod = z.infer<typeof ConfirmRoomInputSchema>;
export type SubmitVoteInputZod = z.infer<typeof SubmitVoteInputSchema>;
export type DeleteVoteInputZod = z.infer<typeof DeleteVoteInputSchema>;
