import React from 'react';
import { RefreshCw, Info } from 'lucide-react';

interface StandingsHeroProps {
  lastUpdated: string | null;
  onRefresh: () => void;
  onOpenRules: () => void;
  isRefreshing?: boolean;
}

export const StandingsHero: React.FC<StandingsHeroProps> = ({
  lastUpdated,
  onRefresh,
  onOpenRules,
  isRefreshing = false,
}) => {
  const formattedTime = lastUpdated
    ? new Date(lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'Just now';

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-200">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">STANDINGS</h1>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-900 border border-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            LIVE SCOREBOARD
          </span>
        </div>
        <p className="text-sm sm:text-base font-medium text-slate-500 mt-1">
          Official points leaderboard · Last synced <span className="font-bold text-slate-800 font-mono">{formattedTime}</span>
        </p>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onOpenRules}
          className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-800 hover:bg-slate-100 transition-colors shadow-xs"
        >
          <Info className="h-4 w-4 text-blue-600" />
          <span>Rules</span>
        </button>

        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-extrabold text-white hover:bg-blue-700 transition-colors shadow-xs disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Sync</span>
        </button>
      </div>
    </div>
  );
};
