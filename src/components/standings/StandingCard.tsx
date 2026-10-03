import React from 'react';
import type { TeamStanding } from '../../types/models';
import { Trophy } from 'lucide-react';

interface StandingCardProps {
  standing: TeamStanding;
  isTopRank?: boolean;
}

export const StandingCard: React.FC<StandingCardProps> = ({ standing }) => {
  const { team, totalPoints, position, resultsCount } = standing;

  const isFirst = position === 1;
  const isSecond = position === 2;
  const isThird = position === 3;

  return (
    <div
      className={`group relative flex items-center justify-between rounded-2xl p-4 transition-all border ${
        isFirst
          ? 'bg-amber-50/60 border-amber-200 shadow-xs'
          : isSecond
          ? 'bg-slate-50/90 border-slate-200'
          : isThird
          ? 'bg-orange-50/50 border-orange-200'
          : 'bg-white border-slate-200 hover:border-slate-300'
      }`}
    >
      {/* Left Column: Rank + Team Info */}
      <div className="flex items-center gap-3.5 sm:gap-5">
        {/* Rank Badge */}
        <div
          className={`flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl font-mono text-base sm:text-lg font-black tabular-nums ${
            isFirst
              ? 'bg-amber-400 text-amber-950 border border-amber-500/30'
              : isSecond
              ? 'bg-slate-200 text-slate-800 border border-slate-300'
              : isThird
              ? 'bg-orange-300 text-orange-950 border border-orange-400/30'
              : 'bg-slate-100 text-slate-600 border border-slate-200'
          }`}
        >
          {position < 10 ? `0${position}` : position}
        </div>

        {/* Team Details */}
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 leading-tight">
              {team.name}
            </h3>
            <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono font-bold text-slate-500 uppercase border border-slate-200">
              {team.code}
            </span>
            {isFirst && (
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-900 border border-amber-300">
                <Trophy className="h-3 w-3" /> Leader
              </span>
            )}
          </div>

          <p className="mt-0.5 text-xs text-slate-500 font-medium">
            {resultsCount} {resultsCount === 1 ? 'result' : 'results'} completed
          </p>
        </div>
      </div>

      {/* Right Column: Points */}
      <div className="text-right shrink-0">
        <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tabular-nums">
          {totalPoints}
        </span>
        <span className="text-[11px] font-bold text-slate-500 block uppercase tracking-wider">
          PTS
        </span>
      </div>
    </div>
  );
};
