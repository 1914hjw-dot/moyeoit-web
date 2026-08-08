import { Room, Vote, HeatmapCellData, GoldenDateRecommendation, AvailabilityStatus, DecisionResult } from '@/types/schema';

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

export function formatKoreanDate(dateStr: string): string {
  if (!dateStr) return '';
  const dateStrClean = dateStr.includes('_') ? dateStr.split('_')[0] : dateStr;
  const slotSuffix = dateStr.includes('_') ? ` (${dateStr.split('_')[1]})` : '';
  const date = new Date(dateStrClean + 'T00:00:00');
  if (isNaN(date.getTime())) return dateStr;
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dayName = DAY_NAMES[date.getDay()];
  return `${month}월 ${day}일 (${dayName})${slotSuffix}`;
}

export function computeHeatmapData(room: Room, votes: Vote[]): Record<string, HeatmapCellData> {
  const result: Record<string, HeatmapCellData> = {};
  const isDateTime = room.schedule_type === 'date_time';

  // Initialize keys for candidates
  for (const date of room.candidate_dates) {
    if (isDateTime && room.time_slots && room.time_slots.length > 0) {
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
  const decision = evaluateDecision(heatmapMap, totalVotersCount);
  return [...decision.topCandidates, ...decision.runnerUpCandidates];
}

/**
 * Enterprise Decision Engine compliant with Section 10, 11, 44 & 53 Rules:
 * Rule 1: N = 0 -> NO_VOTES (never trigger ALL_AVAILABLE for 0 voters).
 * Rule 2: ALL_AVAILABLE -> possible_count === N AND N > 0. List all tied 1st place dates.
 * Rule 3: MAX_AVAILABLE -> max(possible_count). List all tied 1st place dates.
 */
export function evaluateDecision(
  heatmapMap: Record<string, HeatmapCellData>,
  totalVotersCount: number
): DecisionResult {
  const cells = Object.values(heatmapMap);

  if (cells.length === 0 || totalVotersCount === 0) {
    return {
      hasVoters: false,
      totalVoters: 0,
      decisionType: 'NO_VOTES',
      topCandidates: [],
      runnerUpCandidates: [],
    };
  }

  const N = totalVotersCount;

  // Step 1: Check ALL_AVAILABLE (possible_count === N)
  const allAvailableCells = cells.filter((cell) => cell.possible_count === N);

  if (allAvailableCells.length > 0) {
    const isTie = allAvailableCells.length > 1;

    // Sort tied candidates by date ascending
    const sortedAll = [...allAvailableCells].sort((a, b) => a.date.localeCompare(b.date));

    const topCandidates: GoldenDateRecommendation[] = sortedAll.map((cell) =>
      buildRecommendation(cell, N, 1, true, isTie)
    );

    // Runner-ups: remaining cells sorted by possible_count desc
    const remaining = cells
      .filter((cell) => cell.possible_count < N)
      .sort((a, b) => b.possible_count - a.possible_count || a.date.localeCompare(b.date));

    const runnerUpCandidates: GoldenDateRecommendation[] = remaining
      .slice(0, 2)
      .map((cell, idx) => buildRecommendation(cell, N, idx + 2, false, false));

    return {
      hasVoters: true,
      totalVoters: N,
      decisionType: 'ALL_AVAILABLE',
      topCandidates,
      runnerUpCandidates,
    };
  }

  // Step 2: MAX_AVAILABLE (No candidate has 100% possible)
  const maxPossible = Math.max(...cells.map((c) => c.possible_count));
  const maxAvailableCells = cells.filter((cell) => cell.possible_count === maxPossible);
  const isTie = maxAvailableCells.length > 1;

  const sortedMax = [...maxAvailableCells].sort((a, b) => a.date.localeCompare(b.date));

  const topCandidates: GoldenDateRecommendation[] = sortedMax.map((cell) =>
    buildRecommendation(cell, N, 1, false, isTie)
  );

  const remaining = cells
    .filter((cell) => cell.possible_count < maxPossible)
    .sort((a, b) => b.possible_count - a.possible_count || a.date.localeCompare(b.date));

  const runnerUpCandidates: GoldenDateRecommendation[] = remaining
    .slice(0, 2)
    .map((cell, idx) => buildRecommendation(cell, N, idx + 2, false, false));

  return {
    hasVoters: true,
    totalVoters: N,
    decisionType: 'MAX_AVAILABLE',
    topCandidates,
    runnerUpCandidates,
  };
}

function buildRecommendation(
  cell: HeatmapCellData,
  totalVotersCount: number,
  rank: number,
  isAllAvailable: boolean,
  isTie: boolean
): GoldenDateRecommendation {
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
    rank,
    key: cell.key,
    date: cell.date,
    time_slot: cell.time_slot,
    possible_count: cell.possible_count,
    total_voters: totalVotersCount,
    match_percentage: matchPercentage,
    is_all_available: isAllAvailable,
    is_tie: isTie,
    attendee_names: attendeeNames,
    absentee_list: absenteeList,
  };
}
