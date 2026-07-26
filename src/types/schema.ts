export type ScheduleType = 'date_only' | 'date_time';

export type AvailabilityStatus = 'possible' | 'impossible' | 'maybe';

export interface Room {
  id: string;
  title: string;
  description?: string;
  schedule_type: ScheduleType;
  candidate_dates: string[]; // Formatted YYYY-MM-DD
  time_slots: string[]; // e.g. ["오전", "오후", "저녁"] or ["12:00", "18:00"]
  created_at: string;
}

export interface Vote {
  id: string;
  room_id: string;
  nickname: string;
  password_hash?: string;
  availability: Record<string, AvailabilityStatus>; // Key: "YYYY-MM-DD" or "YYYY-MM-DD_TimeSlot"
  note?: string;
  created_at: string;
  updated_at: string;
}

export interface HeatmapCellData {
  key: string;
  date: string;
  time_slot?: string;
  possible_count: number;
  maybe_count: number;
  impossible_count: number;
  total_votes: number;
  ratio: number; // 0.0 ~ 1.0 (possible / total_votes)
  attendees: {
    nickname: string;
    status: AvailabilityStatus;
    note?: string;
  }[];
}

export interface GoldenDateRecommendation {
  rank: number; // 1, 2, 3
  key: string;
  date: string;
  time_slot?: string;
  possible_count: number;
  total_voters: number;
  match_percentage: number;
  attendee_names: string[];
  absentee_list: {
    nickname: string;
    note?: string;
  }[];
}

export interface CreateRoomInput {
  title: string;
  description?: string;
  schedule_type: ScheduleType;
  candidate_dates: string[];
  time_slots?: string[];
}

export interface SubmitVoteInput {
  room_id: string;
  nickname: string;
  password?: string;
  availability: Record<string, AvailabilityStatus>;
  note?: string;
}

export interface DeleteVoteInput {
  room_id: string;
  nickname: string;
  password?: string;
}
