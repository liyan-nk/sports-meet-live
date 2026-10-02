import type { Team, Result, ScoringRule, TeamStanding, StandingsAdjustment } from '../types/models';

/**
 * Calculates dynamic standings based on teams, event results, scoring rules, and standings adjustments.
 * 
 * Conceptually:
 * Total Points = Starting Adjustment Points + Points from Actual Event Results
 * Position = Sort descending by totalPoints -> derive rank
 */
export function calculateStandings(
  teams: Team[],
  results: Result[],
  scoringRules: ScoringRule[],
  adjustments: StandingsAdjustment[] = []
): TeamStanding[] {
  const ruleMap = new Map<number, number>();
  scoringRules.forEach(rule => {
    ruleMap.set(rule.position, rule.points);
  });

  const standingsMap = new Map<string, {
    team: Team;
    adjustmentPoints: number;
    resultPoints: number;
    totalPoints: number;
    resultsCount: number;
    goldCount: number;
    silverCount: number;
    bronzeCount: number;
  }>();

  // Initialize entry for all teams
  teams.forEach(team => {
    standingsMap.set(team.id, {
      team,
      adjustmentPoints: 0,
      resultPoints: 0,
      totalPoints: 0,
      resultsCount: 0,
      goldCount: 0,
      silverCount: 0,
      bronzeCount: 0,
    });
  });

  // Accumulate starting adjustment points
  adjustments.forEach(adj => {
    const entry = standingsMap.get(adj.teamId);
    if (entry) {
      entry.adjustmentPoints += adj.points;
      entry.totalPoints += adj.points;
    }
  });

  // Accumulate actual event result points
  results.forEach(res => {
    const entry = standingsMap.get(res.teamId);
    if (!entry) return;

    const pointsForPosition = res.points ?? ruleMap.get(res.position) ?? 0;
    entry.resultPoints += pointsForPosition;
    entry.totalPoints += pointsForPosition;
    entry.resultsCount += 1;

    if (res.position === 1) entry.goldCount += 1;
    else if (res.position === 2) entry.silverCount += 1;
    else if (res.position === 3) entry.bronzeCount += 1;
  });

  // Sort descending by totalPoints
  const sortedList = Array.from(standingsMap.values()).sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) {
      return b.totalPoints - a.totalPoints;
    }
    if (b.goldCount !== a.goldCount) {
      return b.goldCount - a.goldCount;
    }
    if (b.silverCount !== a.silverCount) {
      return b.silverCount - a.silverCount;
    }
    if (b.bronzeCount !== a.bronzeCount) {
      return b.bronzeCount - a.bronzeCount;
    }
    return a.team.name.localeCompare(b.team.name);
  });

  // Derive rank position dynamically from sorted order
  let currentRank = 1;
  return sortedList.map((item, index) => {
    if (index > 0) {
      const prevItem = sortedList[index - 1];
      if (item.totalPoints === prevItem.totalPoints && item.goldCount === prevItem.goldCount) {
        // Shared rank for equal total points
      } else {
        currentRank = index + 1;
      }
    } else {
      currentRank = 1;
    }

    return {
      team: item.team,
      totalPoints: item.totalPoints,
      adjustmentPoints: item.adjustmentPoints,
      resultPoints: item.resultPoints,
      position: currentRank,
      resultsCount: item.resultsCount,
      goldCount: item.goldCount,
      silverCount: item.silverCount,
      bronzeCount: item.bronzeCount,
    };
  });
}
