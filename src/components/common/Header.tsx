import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Trophy, Activity, Calendar, ShieldCheck } from 'lucide-react';

export const Header: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path || (path === '/standings' && location.pathname === '/');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto max-w-5xl px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between">
          
          {/* Brand & Event Title */}
          <Link to="/" className="group flex items-center gap-3 focus:outline-none">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800 border border-slate-700 text-amber-500 shadow-inner transition-transform group-hover:scale-105">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-sports text-lg tracking-wider text-white">SPORTS MEET</span>
                <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-xs font-bold text-amber-400 border border-amber-500/30">
                  2026
                </span>
              </div>
              <p className="text-[11px] font-medium tracking-wide text-slate-400">
                COLLEGE ANNUAL CHAMPIONSHIP
              </p>
            </div>
          </Link>

          {/* Live Indicator */}
          <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3 py-1 text-xs font-semibold text-emerald-400 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            <span className="tracking-wide">LIVE</span>
          </div>

        </div>

        {/* Modular Navigation Bar */}
        <nav className="mt-3 flex items-center gap-1 border-t border-slate-800/80 pt-2.5 text-xs font-medium">
          <Link
            to="/standings"
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-colors ${
              isActive('/standings')
                ? 'bg-slate-800 text-white font-semibold shadow-sm border border-slate-700'
                : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
            }`}
          >
            <Activity className="h-3.5 w-3.5" />
            <span>Standings</span>
          </Link>

          <Link
            to="/events"
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-colors ${
              isActive('/events')
                ? 'bg-slate-800 text-white font-semibold'
                : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>Events</span>
          </Link>

          <Link
            to="/results"
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-colors ${
              isActive('/results')
                ? 'bg-slate-800 text-white font-semibold'
                : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
            }`}
          >
            <Trophy className="h-3.5 w-3.5" />
            <span>Results</span>
          </Link>

          <div className="ml-auto">
            <Link
              to="/admin"
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-colors ${
                location.pathname.startsWith('/admin')
                  ? 'bg-amber-500/20 text-amber-400 font-semibold border border-amber-500/30'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
              <span>Admin Portal</span>
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
};
