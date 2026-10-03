import React from 'react';
import type { TeamStanding } from '../../types/models';
import { Trophy } from 'lucide-react';

interface StandingCardProps {
  standing: TeamStanding;
  leaderPoints?: number;
}

export const StandingCard: React.FC<StandingCardProps> = ({ standing, leaderPoints }) => {
  const { team, totalPoints, position, resultsCount } = standing;

  const isFirst = position === 1;
  const isSecond = position === 2;
  const isThird = position === 3;

  const diffPoints = (leaderPoints !== undefined && !isFirst) ? (leaderPoints - totalPoints) : 0;

  return (
    <div
      className={`flex items-center justify-between py-5 sm:py-6 px-3 sm:px-4 transition-colors border-b border-slate-200 ${
        isFirst ? 'bg-amber-50/50' : 'hover:bg-slate-100/40'
      }`}
    >
      {/* Left Column: Rank + Team Info */}
      <div className="flex items-center gap-4 sm:gap-6 min-w-0">
        <div
          className={`flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl font-mono text-lg sm:text-xl font-black tabular-nums ${
            isFirst
              ? 'bg-amber-400 text-amber-950 shadow-xs'
              : isSecond
              ? 'bg-slate-200 text-slate-800'
              : isThird
              ? 'bg-amber-100 text-amber-900'
              : 'bg-slate-100 text-slate-600'
          }`}
        >
          0{position}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight truncate">
              {team.name}
            </h3>
            <span className="rounded-md bg-slate-200/80 px-2 py-0.5 text-xs font-mono font-bold text-slate-700 uppercase">
              {team.code}
            </span>
            {isFirst && (
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-0.5 text-xs font-black text-amber-900 border border-amber-300">
                <Trophy className="h-3.5 w-3.5" /> Leading Team
              </span>
            )}
          </div>

          <p className="mt-1 text-sm font-semibold text-slate-500">
            {isFirst
              ? `${resultsCount ?? 0} results completed`
              : `${diffPoints} points behind leader · ${resultsCount ?? 0} results`}
          </p>
        </div>
      </div>

      {/* Right Column: Points */}
      <div className="text-right shrink-0 pl-4">
        <span className="text-3xl sm:text-4xl font-black text-slate-900 font-mono tabular-nums">
          {totalPoints}
        </span>
        <span className="text-xs font-extrabold text-slate-500 block uppercase tracking-wider">
          POINTS
        </span>
      </div>
    </div>
  );
};
