import React from 'react';
import { Lock, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminPage: React.FC = () => {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-8 text-center space-y-4">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 text-slate-400">
        <Lock className="h-6 w-6" />
      </div>
      <h2 className="font-sports text-2xl text-white">ADMINISTRATION PORTAL</h2>
      <div className="max-w-md mx-auto space-y-2">
        <p className="text-xs text-slate-400">
          Admin portal with Supabase Auth + Google OAuth and Row-Level Security (RLS) is scheduled for Phase 2.
        </p>
        <div className="rounded-lg bg-slate-950 p-3 text-[11px] text-slate-400 border border-slate-800 flex items-center gap-2 justify-center">
          <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>Write permissions will be strictly enforced at the database level.</span>
        </div>
      </div>
      <div className="pt-2">
        <Link
          to="/standings"
          className="inline-flex items-center gap-2 rounded bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700"
        >
          <span>Return to Live Standings</span>
        </Link>
      </div>
    </div>
  );
};
