import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Navigate, Link } from 'react-router-dom';
import { ShieldCheck, LogIn, AlertTriangle, ArrowLeft } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';

export const AdminLoginPage: React.FC = () => {
  const { user, isAuthorizedAdmin, isLoading, error, loginWithGoogle, devMockLogin } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
      </div>
    );
  }

  // If user is already authenticated and authorized, redirect to admin dashboard
  if (user && isAuthorizedAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="mx-auto max-w-md py-8">
      
      <div className="mb-6">
        <Link
          to="/standings"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Public Standings</span>
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800 border border-slate-700 text-amber-500 shadow-inner">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="font-sports text-2xl tracking-wide text-white">ADMIN PORTAL</h1>
          <p className="text-xs text-slate-400">
            Authorised Event Operations & Result Entry
          </p>
        </div>

        {/* Unauthorized Warning if logged in but email not whitelisted */}
        {user && !isAuthorizedAdmin && (
          <div className="rounded-xl border border-amber-500/40 bg-amber-950/30 p-4 space-y-2 text-xs text-amber-300">
            <div className="flex items-center gap-2 font-bold text-amber-400">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>Access Denied ({user.email})</span>
            </div>
            <p className="text-amber-200/80 leading-relaxed">
              Your Google email address is authenticated, but is not listed on the authorized admin whitelist.
            </p>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-800/50 bg-red-950/30 p-3 text-xs text-red-400">
            {error}
          </div>
        )}

        {/* Login Action */}
        <div className="space-y-3">
          <button
            onClick={loginWithGoogle}
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-950 transition-colors hover:bg-slate-100 active:scale-98 shadow-md"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          {!isSupabaseConfigured && (
            <div className="pt-3 text-center">
              <span className="text-[11px] text-slate-500">Local Dev Quick Login:</span>
              <div className="mt-1 flex justify-center gap-2">
                <button
                  onClick={() => devMockLogin('admin@example.com')}
                  className="rounded border border-slate-700 bg-slate-800 px-2.5 py-1 text-[11px] text-amber-400 hover:bg-slate-700"
                >
                  admin@example.com
                </button>
                <button
                  onClick={() => devMockLogin('sports@example.com')}
                  className="rounded border border-slate-700 bg-slate-800 px-2.5 py-1 text-[11px] text-slate-300 hover:bg-slate-700"
                >
                  sports@example.com
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Security Info */}
        <div className="rounded-lg bg-slate-950 p-3 text-[11px] text-slate-400 border border-slate-800 space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-slate-300">
            <LogIn className="h-3.5 w-3.5 text-emerald-400" />
            <span>Database-Enforced Security (RLS)</span>
          </div>
          <p>
            Write permissions are verified against the <code className="text-amber-400 font-mono">authorized_admins</code> database table.
          </p>
        </div>

      </div>
    </div>
  );
};
