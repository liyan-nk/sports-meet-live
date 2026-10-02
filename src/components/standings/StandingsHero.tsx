import React from 'react';
import { RefreshCw, Award } from 'lucide-react';

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
    <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-xl">
      {/* Editorial Background Lines */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 h-48 w-48 rounded-full bg-slate-800/30 blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-10 h-40 w-40 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        
        {/* Left Title Column */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="font-sports text-sm tracking-widest text-amber-500">
              SPORTS MEET 2026
            </span>
            <span className="h-1 w-1 rounded-full bg-slate-600" />
            <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
              LIVE POINT TABLE
            </span>
          </div>

          <h1 className="font-sports text-4xl sm:text-5xl lg:text-6xl tracking-tight text-white leading-none">
            LIVE STANDINGS
          </h1>

          <p className="max-w-xl text-xs sm:text-sm text-slate-400">
            Real-time overall team scores calculated dynamically from completed events.
          </p>
        </div>

        {/* Right Action & Info Box */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          
          <button
            onClick={onOpenRules}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-xs font-medium text-slate-200 transition-colors hover:border-slate-600 hover:bg-slate-800 hover:text-white"
          >
            <Award className="h-4 w-4 text-amber-400" />
            <span>Scoring Rules</span>
          </button>

          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 rounded-lg bg-amber-500 px-3.5 py-2 text-xs font-bold text-slate-950 transition-colors hover:bg-amber-400 active:scale-95 disabled:opacity-50"
            title="Refresh current standings"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <div className="w-full text-right sm:w-auto">
            <div className="text-[11px] text-slate-500 font-medium">
              LAST UPDATED: <span className="tabular-nums font-semibold text-slate-300">{formattedTime}</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
