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
    ? new Date(lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : 'Just now';

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-200">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Standings</h1>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Official points leaderboard · Updated <span className="font-semibold text-slate-700 font-mono">{formattedTime}</span>
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onOpenRules}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-xs"
        >
          <Info className="h-4 w-4 text-blue-600" />
          <span>Rules</span>
        </button>

        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-blue-700 transition-colors shadow-xs active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Sync</span>
        </button>
      </div>
    </div>
  );
};
