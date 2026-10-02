import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Navigate, Link } from 'react-router-dom';
import type { AuthorizedAdmin } from '../types/models';
import { adminRepository } from '../data/repositories';
import { ShieldCheck, UserPlus, AlertCircle, CheckCircle, Power, ArrowLeft, RefreshCw } from 'lucide-react';

export const AdminAdminsPage: React.FC = () => {
  const { user, isAuthorizedAdmin, isLoading: isAuthLoading } = useAuth();
  const [admins, setAdmins] = useState<AuthorizedAdmin[]>([]);
  const [newEmail, setNewEmail] = useState<string>('');
  const [newName, setNewName] = useState<string>('');
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadAdmins = useCallback(async () => {
    if (!adminRepository.getAuthorizedAdmins) return;
    try {
      setIsLoading(true);
      const data = await adminRepository.getAuthorizedAdmins();
      setAdmins(data);
    } catch (err) {
      console.error('Failed to load admin whitelist:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user && isAuthorizedAdmin) {
      loadAdmins();
    }
  }, [user, isAuthorizedAdmin, loadAdmins]);

  if (isAuthLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
      </div>
    );
  }

  if (!user || !isAuthorizedAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) {
      setErrorMsg('Please enter a valid Google email address.');
      return;
    }

    if (!adminRepository.addAuthorizedAdmin) {
      alert('Adding authorized admins is only supported in Supabase or mock repository.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      await adminRepository.addAuthorizedAdmin(newEmail.trim(), newName.trim());
      setSuccessMsg(`Added ${newEmail.trim()} to authorized admin whitelist.`);
      setNewEmail('');
      setNewName('');
      await loadAdmins();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to add admin');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleAdmin = async (adminId: string, currentStatus: boolean) => {
    if (!adminRepository.toggleAuthorizedAdmin) return;
    try {
      await adminRepository.toggleAuthorizedAdmin(adminId, !currentStatus);
      await loadAdmins();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to toggle admin status');
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Back Button Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <Link
          to="/admin"
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Operations Dashboard</span>
        </Link>

        <button
          onClick={() => loadAdmins()}
          className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh List</span>
        </button>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl space-y-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-emerald-400" />
            <h1 className="font-sports text-2xl text-white">AUTHORISED ADMIN WHITELIST</h1>
          </div>
          <p className="text-xs text-slate-400">
            Only Google OAuth accounts added to this whitelist can log into the Admin Dashboard and execute database writes.
          </p>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 rounded-xl border border-red-800/60 bg-red-950/40 p-3.5 text-xs text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-800/60 bg-emerald-950/40 p-3.5 text-xs text-emerald-300">
            <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Add Admin Form */}
        <form onSubmit={handleAddAdmin} className="space-y-4 rounded-xl border border-slate-800 bg-slate-950 p-5">
          <h2 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
            <UserPlus className="h-4 w-4 text-amber-400" /> + Add Authorized Google Email
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1 font-semibold">Google Account Email</label>
              <input
                type="email"
                placeholder="admin@college.edu"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1 font-semibold">Full Name (Optional)</label>
              <input
                type="text"
                placeholder="Sports Officer Name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-amber-500 p-2.5 font-sports text-xs text-slate-950 font-bold hover:bg-amber-400 disabled:opacity-50 transition-colors shadow-md"
          >
            {isSubmitting ? 'ADDING EMAIL...' : 'ADD TO WHITELIST'}
          </button>
        </form>

        {/* Whitelisted Admins List */}
        <div className="space-y-3">
          <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Whitelisted Admin Accounts ({admins.length})
          </h2>

          {isLoading ? (
            <div className="p-6 text-center text-xs text-slate-500">Loading admin whitelist...</div>
          ) : admins.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">No admin accounts configured.</div>
          ) : (
            <div className="divide-y divide-slate-800/80 rounded-xl border border-slate-800 bg-slate-950 text-sm">
              {admins.map((adm) => (
                <div key={adm.id} className="p-3.5 flex items-center justify-between gap-3">
                  <div>
                    <span className="block font-semibold text-white">{adm.email}</span>
                    {adm.name && <span className="text-xs text-slate-400">{adm.name}</span>}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleAdmin(adm.id, adm.active)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                      adm.active
                        ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                        : 'border-slate-700 bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Power className="h-3.5 w-3.5" />
                    <span>{adm.active ? 'ACTIVE' : 'DEACTIVATED'}</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
