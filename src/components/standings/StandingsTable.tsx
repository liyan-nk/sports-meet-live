import React from 'react';
import type { TeamStanding } from '../../types/models';
import { StandingCard } from './StandingCard';
import { Trophy } from 'lucide-react';

interface StandingsTableProps {
  standings: TeamStanding[];
  onRefresh?: () => void;
}

export const StandingsTable: React.FC<StandingsTableProps> = ({ standings }) => {
  if (!standings || standings.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
        <p className="text-sm font-medium text-slate-500">No standings data available yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Mobile Stacked Ranking Cards */}
      <div className="space-y-3 sm:hidden">
        {standings.map((item, index) => (
          <StandingCard
            key={item.team.id}
            standing={item}
            isTopRank={index === 0}
          />
        ))}
      </div>

      {/* Desktop Clean Table View */}
      <div className="hidden sm:block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <table className="w-full text-left text-sm text-slate-700">
          <thead className="border-b border-slate-200 bg-slate-50/80 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <tr>
              <th scope="col" className="py-3.5 px-4 w-16 text-center">RANK</th>
              <th scope="col" className="py-3.5 px-4">TEAM</th>
              <th scope="col" className="py-3.5 px-4 text-center">RESULTS</th>
              <th scope="col" className="py-3.5 px-4 text-right pr-6">TOTAL POINTS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {standings.map((item) => {
              const isFirst = item.position === 1;
              const isSecond = item.position === 2;
              const isThird = item.position === 3;

              return (
                <tr
                  key={item.team.id}
                  className={`transition-colors ${
                    isFirst ? 'bg-amber-50/40' : isSecond ? 'bg-slate-50/50' : isThird ? 'bg-orange-50/30' : 'hover:bg-slate-50/60'
                  }`}
                >
                  <td className="py-4 px-4 text-center font-mono text-base font-black">
                    <span className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${
                      isFirst ? 'bg-amber-400 text-amber-950' :
                      isSecond ? 'bg-slate-200 text-slate-800' :
                      isThird ? 'bg-orange-300 text-orange-950' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      0{item.position}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-bold text-slate-900 text-base">
                    <div className="flex items-center gap-2">
                      <span>{item.team.name}</span>
                      <span className="font-mono text-xs text-slate-500 font-semibold">({item.team.code})</span>
                      {isFirst && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-900 border border-amber-300">
                          <Trophy className="h-3 w-3" /> Leader
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center text-xs font-semibold text-slate-500">
                    {item.resultsCount} completed
                  </td>
                  <td className="py-4 px-4 text-right pr-6 font-mono text-2xl font-black text-slate-900 tabular-nums">
                    {item.totalPoints} <span className="text-xs font-bold text-slate-500">PTS</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Temporary Display Ordering Footnote */}
      <div className="pt-1 text-center text-[11px] text-slate-500">
        * Equal points display ordering is temporary. Official tie-break rules will be applied per committee guidelines.
      </div>

    </div>
  );
};
