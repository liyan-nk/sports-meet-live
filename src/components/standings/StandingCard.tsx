import React from 'react';
import type { TeamStanding } from '../../types/models';
import { Trophy } from 'lucide-react';

interface StandingCardProps {
  standing: TeamStanding;
  isTopRank?: boolean;
}

export const StandingCard: React.FC<StandingCardProps> = ({ standing }) => {
  const { team, totalPoints, position, goldCount, silverCount, bronzeCount } = standing;

  // Subtle styling per position
  const getRankBadgeStyle = (pos: number) => {
    switch (pos) {
      case 1:
        return 'bg-amber-500 text-slate-950 font-black shadow-md border border-amber-400';
      case 2:
        return 'bg-slate-300 text-slate-950 font-bold border border-slate-200';
      case 3:
        return 'bg-amber-700 text-white font-bold border border-amber-600';
      default:
        return 'bg-slate-800 text-slate-400 font-semibold border border-slate-700';
    }
  };

  const getCardBorderStyle = (pos: number) => {
    switch (pos) {
      case 1:
        return 'border-amber-500/40 bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 rank-1-border';
      case 2:
        return 'border-slate-700/80 bg-gradient-to-r from-slate-400/5 via-slate-900 to-slate-900 rank-2-border';
      case 3:
        return 'border-amber-800/40 bg-gradient-to-r from-amber-700/5 via-slate-900 to-slate-900 rank-3-border';
      default:
        return 'border-slate-800 bg-slate-900/60 rank-other-border';
    }
  };

  return (
    <div
      className={`group relative flex items-center justify-between rounded-xl border p-4 sm:p-5 transition-all duration-200 hover:border-slate-600 hover:shadow-lg ${getCardBorderStyle(
        position
      )}`}
    >
      {/* Left Column: Position + Team Info */}
      <div className="flex items-center gap-3 sm:gap-5">
        {/* Position Number */}
        <div
          className={`flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-lg font-sports text-xl sm:text-2xl tabular-nums ${getRankBadgeStyle(
            position
          )}`}
        >
          {position}
        </div>

        {/* Team Details */}
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-sports text-xl sm:text-2xl tracking-wide text-white group-hover:text-amber-400 transition-colors">
              {team.name}
            </h3>
            <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono font-bold text-slate-400 uppercase border border-slate-700">
              {team.code}
            </span>
            {position === 1 && (
              <span className="hidden sm:inline-flex items-center gap-1 rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-500/30">
                <Trophy className="h-3 w-3" /> LEADER
              </span>
            )}
          </div>

          {/* Event Medals / Breakdowns */}
          <div className="mt-1 flex items-center gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-amber-400" />
              <span>{goldCount} Gold</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-slate-300" />
              <span>{silverCount} Silver</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-amber-600" />
              <span>{bronzeCount} Bronze</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Points Hero */}
      <div className="text-right shrink-0">
        <div className="font-sports text-3xl sm:text-4xl text-white tabular-nums tracking-tight">
          {totalPoints}
        </div>
        <div className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
          POINTS
        </div>
      </div>
    </div>
  );
};
