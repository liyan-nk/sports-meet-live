import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Navigate, Link } from 'react-router-dom';
import { ShieldCheck, LogIn, AlertTriangle, ArrowLeft } from 'lucide-react';
import { isAppwriteConfigured } from '../lib/appwrite';

export const AdminLoginPage: React.FC = () => {
  const { user, isAuthorizedAdmin, isLoading, error, loginWithGoogle, devMockLogin } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (user && isAuthorizedAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="mx-auto max-w-md py-10 space-y-6">
      
      <div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-300 bg-white p-8 shadow-xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-md">
            <ShieldCheck className="h-8 w-8 text-amber-400" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Admin Sign In</h1>
          <p className="text-sm font-medium text-slate-500">
            Authorized Event Operations & Result Entry Portal
          </p>
        </div>

        {/* Unauthorized Warning */}
        {user && !isAuthorizedAdmin && (
          <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 space-y-2 text-sm text-amber-950 font-medium">
            <div className="flex items-center gap-2 font-bold text-amber-900 text-base">
              <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
              <span>Access Denied ({user.email})</span>
            </div>
            <p className="leading-relaxed">
              Your Google email address is authenticated, but is not listed on the authorized admin whitelist.
            </p>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-950 font-bold">
            {error}
          </div>
        )}

        {/* Login Action */}
        <div className="space-y-4 pt-2">
          <button
            onClick={loginWithGoogle}
            className="flex h-14 w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white px-5 text-base font-extrabold text-slate-900 shadow-xs hover:bg-slate-100 transition-all"
          >
            <svg className="h-6 w-6" viewBox="0 0 24 24">
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
            <span>Sign In with Google</span>
          </button>

          {!isAppwriteConfigured && (
            <div className="pt-3 text-center space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Local Mock Sign In:</span>
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => devMockLogin('admin@example.com')}
                  className="rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2 text-xs font-extrabold text-blue-700 hover:bg-slate-100"
                >
                  admin@example.com
                </button>
                <button
                  onClick={() => devMockLogin('sports@example.com')}
                  className="rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2 text-xs font-extrabold text-slate-800 hover:bg-slate-100"
                >
                  sports@example.com
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Security Info */}
        <div className="rounded-xl bg-slate-50 p-4 text-xs font-medium text-slate-700 border border-slate-200 space-y-1">
          <div className="flex items-center gap-2 font-black text-slate-900">
            <LogIn className="h-4 w-4 text-emerald-600" />
            <span>Appwrite Whitelist Protection</span>
          </div>
          <p>
            Write permissions are strictly enforced against the <code className="text-blue-700 font-mono font-bold">authorized_admins</code> collection.
          </p>
        </div>

      </div>
    </div>
  );
};
