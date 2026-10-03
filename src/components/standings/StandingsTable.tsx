import React from 'react';
import type { TeamStanding } from '../../types/models';
import { StandingCard } from './StandingCard';

interface StandingsTableProps {
  standings: TeamStanding[];
  onRefresh?: () => void;
}

export const StandingsTable: React.FC<StandingsTableProps> = ({ standings }) => {
  if (!standings || standings.length === 0) {
    return (
      <div className="py-12 text-center border-t border-b border-slate-200">
        <p className="text-base font-semibold text-slate-500">No standings data recorded yet.</p>
      </div>
    );
  }

  const leaderPoints = standings[0]?.totalPoints || 0;

  return (
    <div className="space-y-6">
      
      {/* Editorial Scoreboard List (Responsive & Unified) */}
      <div className="divide-y divide-slate-200 border-t border-b border-slate-200">
        {standings.map((item) => (
          <StandingCard
            key={item.team.id}
            standing={item}
            leaderPoints={leaderPoints}
          />
        ))}
      </div>

      {/* Temporary Display Ordering Footnote */}
      <div className="text-center text-sm font-medium text-slate-500 pt-2">
        * Temporary display ordering applied for equal points. Official tie-break rules will be evaluated by committee.
      </div>

    </div>
  );
};
