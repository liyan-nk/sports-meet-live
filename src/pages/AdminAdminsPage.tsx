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
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
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
      alert('Adding authorized admins is supported in Appwrite or mock repository.');
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
    <div className="space-y-5 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <Link
          to="/admin"
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Link>

        <button
          onClick={() => loadAdmins()}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Sync</span>
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-emerald-600" />
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Authorized Admins</h1>
          </div>
          <p className="text-xs text-slate-500">
            Only Google OAuth accounts added to this whitelist can access the Admin Dashboard and execute database writes.
          </p>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
            <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Add Admin Form */}
        <form onSubmit={handleAddAdmin} className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <UserPlus className="h-4 w-4 text-blue-600" /> Add Authorized Google Email
          </h2>
          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Google Account Email</label>
              <input
                type="email"
                placeholder="admin@college.edu"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none shadow-xs"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name (Optional)</label>
              <input
                type="text"
                placeholder="Sports Officer Name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none shadow-xs"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 rounded-xl bg-blue-600 text-xs text-white font-extrabold hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-xs"
          >
            {isSubmitting ? 'Adding Email...' : '+ Add To Whitelist'}
          </button>
        </form>

        {/* Whitelisted Admins List */}
        <div className="space-y-2.5">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Whitelisted Admin Accounts ({admins.length})
          </h2>

          {isLoading ? (
            <div className="p-6 text-center text-xs text-slate-500">Loading admin whitelist...</div>
          ) : admins.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">No admin accounts configured.</div>
          ) : (
            <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white text-xs">
              {admins.map((adm) => (
                <div key={adm.id} className="p-3 flex items-center justify-between gap-3">
                  <div>
                    <span className="block font-bold text-slate-900">{adm.email}</span>
                    {adm.name && <span className="text-[11px] text-slate-500">{adm.name}</span>}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleAdmin(adm.id, adm.active)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                      adm.active
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        : 'border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200'
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
