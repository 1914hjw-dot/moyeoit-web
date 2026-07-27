import { Room, Vote, HeatmapCellData, GoldenDateRecommendation, AvailabilityStatus } from '@/types/schema';

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

export function formatKoreanDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dayName = DAY_NAMES[date.getDay()];
  return `${month}월 ${day}일 (${dayName})`;
}

export function computeHeatmapData(room: Room, votes: Vote[]): Record<string, HeatmapCellData> {
  const result: Record<string, HeatmapCellData> = {};
  const isDateTime = room.schedule_type === 'date_time';

  // Initialize keys for candidates
  for (const date of room.candidate_dates) {
    if (isDateTime && room.time_slots.length > 0) {
      for (const slot of room.time_slots) {
        const key = `${date}_${slot}`;
        result[key] = {
          key,
          date,
          time_slot: slot,
          possible_count: 0,
          maybe_count: 0,
          impossible_count: 0,
          total_votes: votes.length,
          ratio: 0,
          attendees: [],
        };
      }
    } else {
      const key = date;
      result[key] = {
        key,
        date,
        possible_count: 0,
        maybe_count: 0,
        impossible_count: 0,
        total_votes: votes.length,
        ratio: 0,
        attendees: [],
      };
    }
  }

  // Populate votes data
  for (const vote of votes) {
    for (const [key, status] of Object.entries(vote.availability)) {
      if (result[key]) {
        if (status === 'possible') result[key].possible_count++;
        else if (status === 'maybe') result[key].maybe_count++;
        else if (status === 'impossible') result[key].impossible_count++;

        result[key].attendees.push({
          nickname: vote.nickname,
          status: status as AvailabilityStatus,
          note: vote.note,
        });
      }
    }
  }

  // Compute attendance ratio (possible count / total voters)
  const totalVoters = votes.length;
  for (const key in result) {
    if (totalVoters > 0) {
      // Possible = 1.0 weight, Maybe = 0.5 weight
      const weightedScore = result[key].possible_count + result[key].maybe_count * 0.5;
      result[key].ratio = Math.min(1, Math.max(0, weightedScore / totalVoters));
    }
  }

  return result;
}

export function extractGoldenDates(
  heatmapMap: Record<string, HeatmapCellData>,
  totalVotersCount: number
): GoldenDateRecommendation[] {
  const cells = Object.values(heatmapMap);

  if (cells.length === 0 || totalVotersCount === 0) {
    return [];
  }

  // Sort cells by score:
  // 1. Possible count descending
  // 2. Maybe/Undecided count descending
  // 3. Date ascending (Earliest date gets priority rank on tie)
  const sorted = [...cells].sort((a, b) => {
    if (b.possible_count !== a.possible_count) {
      return b.possible_count - a.possible_count;
    }
    if (b.maybe_count !== a.maybe_count) {
      return b.maybe_count - a.maybe_count;
    }
    if (a.date !== b.date) {
      return a.date.localeCompare(b.date);
    }
    return a.key.localeCompare(b.key);
  });

  // Take top 3
  return sorted.slice(0, 3).map((cell, index) => {
    const attendeeNames = cell.attendees
      .filter((att) => att.status === 'possible' || att.status === 'maybe')
      .map((att) => (att.status === 'maybe' ? `${att.nickname}(미정)` : att.nickname));

    const absenteeList = cell.attendees
      .filter((att) => att.status === 'impossible')
      .map((att) => ({ nickname: att.nickname, note: att.note }));

    const matchPercentage = Math.round(
      ((cell.possible_count + cell.maybe_count * 0.5) / Math.max(1, totalVotersCount)) * 100
    );

    return {
      rank: index + 1,
      key: cell.key,
      date: cell.date,
      time_slot: cell.time_slot,
      possible_count: cell.possible_count,
      total_voters: totalVotersCount,
      match_percentage: matchPercentage,
      attendee_names: attendeeNames,
      absentee_list: absenteeList,
    };
  });
}
