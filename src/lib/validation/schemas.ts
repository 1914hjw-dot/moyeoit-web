import { z } from 'zod';

export const ScheduleTypeSchema = z.enum(['date_only', 'date_time']);

export const AvailabilityStatusSchema = z.enum(['possible', 'impossible', 'maybe']);

export const CreateRoomInputSchema = z.object({
  title: z
    .string()
    .min(1, { message: '모임 제목을 입력해 주세요.' })
    .max(80, { message: '모임 제목은 최대 80자까지 입력 가능합니다.' }),
  description: z
    .string()
    .max(200, { message: '안내 문구는 최대 200자까지 입력 가능합니다.' })
    .optional()
    .default(''),
  schedule_type: ScheduleTypeSchema.default('date_only'),
  candidate_dates: z
    .array(z.string().min(1))
    .min(1, { message: '최소 1개 이상의 후보 날짜를 선택해 주세요.' })
    .max(31, { message: '후보 날짜는 최대 31개까지 선택 가능합니다.' }),
  time_slots: z
    .array(z.string())
    .max(10, { message: '시간대는 최대 10개까지 설정 가능합니다.' })
    .optional()
    .default([]),
});

export const SubmitVoteInputSchema = z.object({
  room_id: z.string().min(1, { message: '올바른 방 번호가 필요합니다.' }),
  nickname: z
    .string()
    .min(1, { message: '닉네임을 입력해 주세요.' })
    .max(30, { message: '닉네임은 최대 30자까지 입력 가능합니다.' }),
  password: z.string().max(20).optional().default(''),
  availability: z.record(z.string(), AvailabilityStatusSchema),
  note: z
    .string()
    .max(200, { message: '한줄 메모는 최대 200자까지 입력 가능합니다.' })
    .optional()
    .default(''),
});

export const DeleteVoteInputSchema = z.object({
  room_id: z.string().min(1, { message: '올바른 방 번호가 필요합니다.' }),
  nickname: z
    .string()
    .min(1, { message: '닉네임을 입력해 주세요.' })
    .max(30, { message: '닉네임은 최대 30자까지 입력 가능합니다.' }),
  password: z.string().max(20).optional().default(''),
});

export type CreateRoomInputZod = z.infer<typeof CreateRoomInputSchema>;
export type SubmitVoteInputZod = z.infer<typeof SubmitVoteInputSchema>;
export type DeleteVoteInputZod = z.infer<typeof DeleteVoteInputSchema>;
