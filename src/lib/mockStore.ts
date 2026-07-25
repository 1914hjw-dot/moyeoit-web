import { Room, Vote, CreateRoomInput, SubmitVoteInput } from '@/types/schema';
import { hashPassword, sanitizeInput } from '@/lib/crypto';

// Initial demo mock data
const INITIAL_ROOMS: Room[] = [
  {
    id: 'demo-room-1',
    title: '🎉 7월 모여잇 정기 스터디 모임',
    description: '가장 많은 인원이 올 수 있는 황금 날짜로 정해요!',
    schedule_type: 'date_only',
    candidate_dates: [
      '2026-07-26',
      '2026-07-27',
      '2026-07-28',
      '2026-07-29',
      '2026-07-30',
      '2026-07-31',
    ],
    time_slots: [],
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo-room-2',
    title: '☕ 주말 파티룸 모임 (시간대 지정)',
    description: '오전/오후/저녁 중 편하신 타임을 클릭해주세요.',
    schedule_type: 'date_time',
    candidate_dates: ['2026-07-31', '2026-08-01', '2026-08-02'],
    time_slots: ['오전(10:00~14:00)', '오후(14:00~18:00)', '저녁(18:00~22:00)'],
    created_at: new Date().toISOString(),
  },
];

const INITIAL_VOTES: Vote[] = [
  {
    id: 'v-1',
    room_id: 'demo-room-1',
    nickname: '민수',
    password_hash: 'demo_hashed_pw_1',
    availability: {
      '2026-07-26': 'possible',
      '2026-07-27': 'possible',
      '2026-07-28': 'impossible',
      '2026-07-29': 'maybe',
      '2026-07-30': 'possible',
      '2026-07-31': 'possible',
    },
    note: '28일은 야근 예정입니다 ㅠㅠ',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'v-2',
    room_id: 'demo-room-1',
    nickname: '지현',
    password_hash: 'demo_hashed_pw_2',
    availability: {
      '2026-07-26': 'possible',
      '2026-07-27': 'possible',
      '2026-07-28': 'possible',
      '2026-07-29': 'possible',
      '2026-07-30': 'impossible',
      '2026-07-31': 'impossible',
    },
    note: '주말은 상관없어요!',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'v-3',
    room_id: 'demo-room-1',
    nickname: '수진',
    password_hash: 'demo_hashed_pw_3',
    availability: {
      '2026-07-26': 'possible',
      '2026-07-27': 'impossible',
      '2026-07-28': 'possible',
      '2026-07-29': 'possible',
      '2026-07-30': 'possible',
      '2026-07-31': 'possible',
    },
    note: '강남/신촌 어디든 좋아요',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const ROOMS_KEY = 'moyeoit_rooms_store';
const VOTES_KEY = 'moyeoit_votes_store';

// Rate Limiting & Anti-Bruteforce State Store
const FAILED_ATTEMPTS: Record<string, { count: number; lastTime: number }> = {};
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 60000; // 1 min lock for 5 consecutive failures

function checkRateLimit(key: string): void {
  const now = Date.now();
  const record = FAILED_ATTEMPTS[key];
  if (record) {
    if (record.count >= MAX_ATTEMPTS) {
      const elapsed = now - record.lastTime;
      if (elapsed < LOCKOUT_MS) {
        const remainingSec = Math.ceil((LOCKOUT_MS - elapsed) / 1000);
        throw new Error(`비밀번호 연속 실패로 제한되었습니다. ${remainingSec}초 후 다시 시도해 주세요.`);
      } else {
        // Reset after lockout period
        FAILED_ATTEMPTS[key] = { count: 0, lastTime: now };
      }
    }
  }
}

function recordFailedAttempt(key: string): void {
  const now = Date.now();
  const record = FAILED_ATTEMPTS[key] || { count: 0, lastTime: now };
  FAILED_ATTEMPTS[key] = {
    count: record.count + 1,
    lastTime: now,
  };
}

function clearFailedAttempt(key: string): void {
  delete FAILED_ATTEMPTS[key];
}

function getStoredRooms(): Room[] {
  if (typeof window === 'undefined') return INITIAL_ROOMS;
  try {
    const raw = localStorage.getItem(ROOMS_KEY);
    return raw ? JSON.parse(raw) : INITIAL_ROOMS;
  } catch {
    return INITIAL_ROOMS;
  }
}

function saveStoredRooms(rooms: Room[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ROOMS_KEY, JSON.stringify(rooms));
  } catch (e) {
    console.error('Failed to save rooms', e);
  }
}

function getStoredVotes(): Vote[] {
  if (typeof window === 'undefined') return INITIAL_VOTES;
  try {
    const raw = localStorage.getItem(VOTES_KEY);
    return raw ? JSON.parse(raw) : INITIAL_VOTES;
  } catch {
    return INITIAL_VOTES;
  }
}

function saveStoredVotes(votes: Vote[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(VOTES_KEY, JSON.stringify(votes));
  } catch (e) {
    console.error('Failed to save votes', e);
  }
}

export function createRoomMock(input: CreateRoomInput): Room {
  const cleanTitle = sanitizeInput(input.title, 80);
  const cleanDesc = sanitizeInput(input.description || '', 200);

  if (!cleanTitle) {
    throw new Error('올바른 모임 제목을 입력해 주세요.');
  }

  const rooms = getStoredRooms();
  const newRoom: Room = {
    id: `moyeoit-${Math.random().toString(36).substring(2, 9)}`,
    title: cleanTitle,
    description: cleanDesc,
    schedule_type: input.schedule_type === 'date_time' ? 'date_time' : 'date_only',
    candidate_dates: (input.candidate_dates || []).slice(0, 31).map((d) => sanitizeInput(d, 20)),
    time_slots: (input.time_slots || []).slice(0, 10).map((s) => sanitizeInput(s, 50)),
    created_at: new Date().toISOString(),
  };

  rooms.push(newRoom);
  saveStoredRooms(rooms);
  return newRoom;
}

export function getRoomByIdMock(id: string): Room | null {
  const cleanId = sanitizeInput(id, 50);
  const rooms = getStoredRooms();
  return rooms.find((r) => r.id === cleanId) || null;
}

export function getVotesByRoomIdMock(roomId: string): Vote[] {
  const cleanRoomId = sanitizeInput(roomId, 50);
  const votes = getStoredVotes();
  // Strip password_hash from returning objects to prevent hash leaks!
  return votes
    .filter((v) => v.room_id === cleanRoomId)
    .map((v) => ({
      ...v,
      password_hash: undefined, // Never expose password hash in response
    }));
}

export async function submitVoteMock(input: SubmitVoteInput): Promise<Vote> {
  const cleanRoomId = sanitizeInput(input.room_id, 50);
  const cleanNickname = sanitizeInput(input.nickname, 30);
  const cleanNote = sanitizeInput(input.note || '', 200);

  if (!cleanNickname) {
    throw new Error('올바른 닉네임을 입력해 주세요.');
  }

  const votes = getStoredVotes();
  const existingIndex = votes.findIndex(
    (v) => v.room_id === cleanRoomId && v.nickname.trim().toLowerCase() === cleanNickname.toLowerCase()
  );

  const now = new Date().toISOString();
  const hashedInputPw = input.password ? await hashPassword(input.password) : '';
  const attemptKey = `${cleanRoomId}_${cleanNickname.toLowerCase()}`;

  if (existingIndex >= 0) {
    const existing = votes[existingIndex];

    // Check anti-bruteforce rate limit before checking password
    checkRateLimit(attemptKey);

    // Strict IDOR & Password Authorization Check
    if (existing.password_hash) {
      if (!hashedInputPw || existing.password_hash !== hashedInputPw) {
        recordFailedAttempt(attemptKey);
        throw new Error('비밀번호가 일치하지 않습니다. 본인의 닉네임과 설정한 비밀번호를 확인해 주세요.');
      }
    }

    clearFailedAttempt(attemptKey);

    const updatedVote: Vote = {
      ...existing,
      password_hash: hashedInputPw || existing.password_hash,
      availability: input.availability,
      note: cleanNote,
      updated_at: now,
    };
    votes[existingIndex] = updatedVote;
    saveStoredVotes(votes);

    // Return safe sanitized vote without password hash
    return {
      ...updatedVote,
      password_hash: undefined,
    };
  } else {
    const newVote: Vote = {
      id: `vote-${Math.random().toString(36).substring(2, 9)}`,
      room_id: cleanRoomId,
      nickname: cleanNickname,
      password_hash: hashedInputPw,
      availability: input.availability,
      note: cleanNote,
      created_at: now,
      updated_at: now,
    };
    votes.push(newVote);
    saveStoredVotes(votes);

    return {
      ...newVote,
      password_hash: undefined,
    };
  }
}
