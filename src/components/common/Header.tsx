import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Trophy, Home, Calendar, Award, ShieldCheck } from 'lucide-react';

export const Header: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto max-w-4xl px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between">
          
          {/* Brand & Event Title */}
          <Link to="/" className="group flex items-center gap-2.5 focus:outline-none">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm transition-transform group-hover:scale-105">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold tracking-tight text-slate-900 sm:text-lg">SPORTS MEET</span>
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-700 border border-blue-200">
                  2026
                </span>
              </div>
              <p className="text-[11px] font-medium tracking-wide text-slate-500 hidden sm:block">
                ANNUAL ATHLETICS CHAMPIONSHIP
              </p>
            </div>
          </Link>

          {/* Right Area: Live Badge + Desktop Admin Link */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              <span>LIVE</span>
            </div>

            <Link
              to="/admin"
              className="hidden sm:flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <ShieldCheck className="h-4 w-4 text-blue-600" />
              <span>Admin Portal</span>
            </Link>
          </div>
        </div>

        {/* Desktop Navigation Links (Hidden on Mobile) */}
        <nav aria-label="Desktop Navigation" className="mt-3 hidden sm:flex items-center gap-1 border-t border-slate-100 pt-2.5 text-xs font-semibold">
          <Link
            to="/"
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-colors ${
              isActive('/')
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Home className="h-4 w-4" />
            <span>Home</span>
          </Link>

          <Link
            to="/standings"
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-colors ${
              isActive('/standings')
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Trophy className="h-4 w-4" />
            <span>Standings</span>
          </Link>

          <Link
            to="/events"
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-colors ${
              isActive('/events')
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span>Events</span>
          </Link>

          <Link
            to="/results"
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-colors ${
              isActive('/results')
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Award className="h-4 w-4" />
            <span>Results</span>
          </Link>
        </nav>
      </div>
    </header>
  );
};
