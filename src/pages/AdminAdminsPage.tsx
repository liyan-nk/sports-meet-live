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
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
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
    <div className="space-y-8 max-w-2xl mx-auto">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <Link
          to="/admin"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-800 hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Link>

        <button
          onClick={() => loadAdmins()}
          className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-800 hover:bg-slate-100 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Sync</span>
        </button>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-7 w-7 text-emerald-600" />
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">AUTHORIZED ADMINS</h1>
          </div>
          <p className="text-sm font-semibold text-slate-500">
            Only Google accounts added to this whitelist can log into the Admin Dashboard and execute database mutations.
          </p>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-950 font-bold">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-950 font-bold">
            <CheckCircle className="h-5 w-5 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Add Admin Form */}
        <form onSubmit={handleAddAdmin} className="space-y-4 pt-4 border-t border-slate-200">
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-blue-600" /> Add Authorized Google Email
          </h2>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-slate-800">Google Account Email</label>
              <input
                type="email"
                placeholder="admin@college.edu"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full h-12 rounded-xl border border-slate-300 bg-white px-4 text-base font-medium text-slate-900 focus:border-blue-600 focus:outline-none"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-slate-800">Full Name (Optional)</label>
              <input
                type="text"
                placeholder="Sports Officer Name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full h-12 rounded-xl border border-slate-300 bg-white px-4 text-base font-medium text-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 rounded-xl bg-blue-600 text-base font-extrabold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-xs"
          >
            {isSubmitting ? 'Adding Email...' : '+ ADD TO WHITELIST'}
          </button>
        </form>

        {/* Whitelisted Admins List */}
        <div className="space-y-4 pt-6 border-t border-slate-200">
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-700">
            Whitelisted Admin Accounts ({admins.length})
          </h2>

          {isLoading ? (
            <p className="py-4 text-base text-slate-500">Loading admin whitelist...</p>
          ) : admins.length === 0 ? (
            <p className="py-4 text-base text-slate-500">No admin accounts configured.</p>
          ) : (
            <div className="divide-y divide-slate-200 border-t border-b border-slate-200">
              {admins.map((adm) => (
                <div key={adm.id} className="py-4 px-2 flex items-center justify-between gap-4">
                  <div>
                    <span className="block text-base font-extrabold text-slate-900">{adm.email}</span>
                    {adm.name && <span className="text-sm font-medium text-slate-500">{adm.name}</span>}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleAdmin(adm.id, adm.active)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black border transition-colors ${
                      adm.active
                        ? 'border-emerald-300 bg-emerald-100 text-emerald-900 hover:bg-emerald-200'
                        : 'border-slate-300 bg-slate-200 text-slate-800 hover:bg-slate-300'
                    }`}
                  >
                    <Power className="h-4 w-4" />
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
