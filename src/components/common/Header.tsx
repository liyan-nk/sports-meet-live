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
      <div className="mx-auto max-w-4xl px-4 py-3 sm:px-8">
        <div className="flex items-center justify-between gap-2">
          
          {/* Brand Logo & Title (Single Line, No Wrapping) */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white shadow-xs">
              <Trophy className="h-5 w-5 text-amber-400" />
            </div>
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="text-base sm:text-xl font-black tracking-tight text-slate-900">SPORTS MEET</span>
              <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-xs font-black text-slate-700 border border-slate-200">
                2026
              </span>
            </div>
          </Link>

          {/* Compact Live Indicator & Desktop Admin Link */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-800 whitespace-nowrap">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              <span>LIVE</span>
            </div>

            <Link
              to="/admin"
              className="hidden sm:flex items-center gap-2 rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-1.5 text-xs font-bold text-slate-800 hover:bg-slate-100 transition-colors whitespace-nowrap"
            >
              <ShieldCheck className="h-4 w-4 text-blue-600" />
              <span>Admin Portal</span>
            </Link>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav aria-label="Desktop Navigation" className="mt-3 hidden sm:flex items-center gap-2 border-t border-slate-100 pt-3 text-sm font-bold">
          <Link
            to="/"
            className={`flex items-center gap-2 rounded-xl px-4 py-2 transition-colors ${
              isActive('/')
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Home className="h-4 w-4" />
            <span>Home</span>
          </Link>

          <Link
            to="/standings"
            className={`flex items-center gap-2 rounded-xl px-4 py-2 transition-colors ${
              isActive('/standings')
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Trophy className="h-4 w-4" />
            <span>Standings</span>
          </Link>

          <Link
            to="/events"
            className={`flex items-center gap-2 rounded-xl px-4 py-2 transition-colors ${
              isActive('/events')
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span>Events</span>
          </Link>

          <Link
            to="/results"
            className={`flex items-center gap-2 rounded-xl px-4 py-2 transition-colors ${
              isActive('/results')
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
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
