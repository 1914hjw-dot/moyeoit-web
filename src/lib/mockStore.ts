import { Room, Vote, CreateRoomInput, SubmitVoteInput } from '@/types/schema';

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
  const rooms = getStoredRooms();
  const newRoom: Room = {
    id: `moyeoit-${Math.random().toString(36).substring(2, 9)}`,
    title: input.title,
    description: input.description,
    schedule_type: input.schedule_type,
    candidate_dates: input.candidate_dates,
    time_slots: input.time_slots || [],
    created_at: new Date().toISOString(),
  };

  rooms.push(newRoom);
  saveStoredRooms(rooms);
  return newRoom;
}

export function getRoomByIdMock(id: string): Room | null {
  const rooms = getStoredRooms();
  return rooms.find((r) => r.id === id) || null;
}

export function getVotesByRoomIdMock(roomId: string): Vote[] {
  const votes = getStoredVotes();
  return votes.filter((v) => v.room_id === roomId);
}

export function submitVoteMock(input: SubmitVoteInput): Vote {
  const votes = getStoredVotes();
  const existingIndex = votes.findIndex(
    (v) => v.room_id === input.room_id && v.nickname.trim().toLowerCase() === input.nickname.trim().toLowerCase()
  );

  const now = new Date().toISOString();

  if (existingIndex >= 0) {
    // Update existing vote
    const existing = votes[existingIndex];
    const updatedVote: Vote = {
      ...existing,
      availability: input.availability,
      note: input.note,
      updated_at: now,
    };
    votes[existingIndex] = updatedVote;
    saveStoredVotes(votes);
    return updatedVote;
  } else {
    // Create new vote
    const newVote: Vote = {
      id: `vote-${Math.random().toString(36).substring(2, 9)}`,
      room_id: input.room_id,
      nickname: input.nickname.trim(),
      password_hash: input.password || '',
      availability: input.availability,
      note: input.note,
      created_at: now,
      updated_at: now,
    };
    votes.push(newVote);
    saveStoredVotes(votes);
    return newVote;
  }
}
