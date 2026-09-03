export type ScheduleType = 'date_only' | 'date_time';

export type AvailabilityStatus = 'possible' | 'impossible' | 'maybe';

export type RoomStatus = 'OPEN' | 'CONFIRMED' | 'DELETED';

export type DateSelectionMode = 'RANGE' | 'FREE';

export interface Room {
  id: string; // UUID v4 for new rooms, legacy string for old rooms
  legacy_slug?: string | null; // Nullable legacy slug for backward compatibility
  secret_hash?: string | null; // Secret hash for host administration
  title: string;
  description?: string;
  schedule_type: ScheduleType;
  candidate_dates: string[]; // Formatted YYYY-MM-DD
  time_slots: string[]; // e.g. ["오전", "오후", "저녁"] or ["12:00", "18:00"]
  status: RoomStatus;
  confirmed_date?: string | null;
  confirmed_at?: string | null;
  date_selection_mode: DateSelectionMode;
  created_at: string;
  deleted_at?: string | null;
}

export type PublicRoom = Omit<Room, 'secret_hash' | 'deleted_at'>;

export interface CreatedRoom extends PublicRoom {
  host_secret: string;
}

export interface Vote {
  id: string;
  room_id: string;
  vote_token?: string | null; // Cryptographic UUID token for direct vote ownership
  nickname: string;
  password_hash?: string;
  availability: Record<string, AvailabilityStatus>; // Key: "YYYY-MM-DD" or "YYYY-MM-DD_TimeSlot"
  note?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export type PublicVote = Omit<Vote, 'vote_token' | 'password_hash' | 'deleted_at'>;
export type OwnedVote = Omit<Vote, 'password_hash' | 'deleted_at'>;

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
  is_all_available: boolean; // True if possible_count === total_voters AND total_voters > 0
  is_tie?: boolean; // True if multiple candidates share 1st place
  attendee_names: string[];
  absentee_list: {
    nickname: string;
    note?: string;
  }[];
}

export interface DecisionResult {
  hasVoters: boolean;
  totalVoters: number;
  decisionType: 'ALL_AVAILABLE' | 'MAX_AVAILABLE' | 'NO_VOTES';
  topCandidates: GoldenDateRecommendation[];
  runnerUpCandidates: GoldenDateRecommendation[];
}

export interface CreateRoomInput {
  title: string;
  description?: string;
  schedule_type: ScheduleType;
  candidate_dates: string[];
  time_slots?: string[];
  date_selection_mode?: DateSelectionMode;
}

export interface ConfirmRoomInput {
  room_id: string;
  confirmed_date: string;
  host_secret?: string;
}

export interface SubmitVoteInput {
  room_id: string;
  nickname: string;
  password?: string;
  vote_token?: string;
  availability: Record<string, AvailabilityStatus>;
  note?: string;
}

export interface DeleteVoteInput {
  room_id: string;
  nickname: string;
  password?: string;
  vote_token?: string;
}

export interface AuditLog {
  id: string;
  event_type: 'ROOM_CREATED' | 'ROOM_CONFIRMED' | 'ROOM_DELETED' | 'VOTE_CREATED' | 'VOTE_UPDATED' | 'VOTE_DELETED';
  target_id: string;
  ip_address?: string;
  user_agent?: string;
  payload?: unknown;
  created_at: string;
}
