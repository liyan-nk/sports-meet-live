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
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-12 text-center">
        <p className="text-sm text-slate-400">No standings data available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Table Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
          <h2 className="font-sports text-xl tracking-wider text-white">
            CURRENT OVERALL STANDINGS
          </h2>
        </div>
      </div>

      {/* Mobile-first Cards Stack */}
      <div className="space-y-3">
        {standings.map((item, index) => (
          <StandingCard
            key={item.team.id}
            standing={item}
            isTopRank={index === 0}
          />
        ))}
      </div>

      {/* Accessible Tabular View for Desktop / Screen Readers */}
      <div className="mt-8 hidden sm:block overflow-hidden rounded-xl border border-slate-800 bg-slate-900/40">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="border-b border-slate-800 bg-slate-900 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <tr>
              <th scope="col" className="py-3.5 px-4 w-16 text-center">POS</th>
              <th scope="col" className="py-3.5 px-4">TEAM</th>
              <th scope="col" className="py-3.5 px-4 text-center">GOLD</th>
              <th scope="col" className="py-3.5 px-4 text-center">SILVER</th>
              <th scope="col" className="py-3.5 px-4 text-center">BRONZE</th>
              <th scope="col" className="py-3.5 px-4 text-right pr-6">TOTAL POINTS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {standings.map((item) => (
              <tr key={item.team.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3.5 px-4 text-center font-sports text-base font-bold text-white">
                  #{item.position}
                </td>
                <td className="py-3.5 px-4 font-sports text-lg text-white">
                  {item.team.name}
                  <span className="ml-2 font-mono text-xs text-slate-400">({item.team.code})</span>
                </td>
                <td className="py-3.5 px-4 text-center text-amber-400 font-bold">{item.goldCount}</td>
                <td className="py-3.5 px-4 text-center text-slate-300 font-semibold">{item.silverCount}</td>
                <td className="py-3.5 px-4 text-center text-amber-600 font-semibold">{item.bronzeCount}</td>
                <td className="py-3.5 px-4 text-right pr-6 font-sports text-xl font-bold text-white tabular-nums">
                  {item.totalPoints} PTS
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Temporary Display Ordering Footnote */}
      <div className="pt-2 text-center text-[11px] text-slate-500">
        * Equal points display ordering is a temporary UI rule. Official tie-break policy will be determined by the Sports Meet committee.
      </div>

    </div>
  );
};
