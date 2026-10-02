import React, { useState, useEffect, useCallback } from 'react';
import type { AuthorizedAdmin } from '../../types/models';
import { adminRepository } from '../../data/repositories';
import { ShieldCheck, UserPlus, X, AlertCircle, CheckCircle, Power } from 'lucide-react';

interface AdminWhitelistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminWhitelistModal: React.FC<AdminWhitelistModalProps> = ({
  isOpen,
  onClose,
}) => {
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
    if (isOpen) {
      loadAdmins();
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [isOpen, loadAdmins]);

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            <h2 className="font-sports text-xl text-white">AUTHORIZED ADMIN WHITELIST</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-xs text-slate-400">
          Only Google OAuth accounts listed in this whitelist can access admin dashboard operations and write to database tables.
        </p>

        {errorMsg && (
          <div className="flex items-center gap-2 rounded-lg border border-red-800/60 bg-red-950/40 p-3 text-xs text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-center gap-2 rounded-lg border border-emerald-800/60 bg-emerald-950/40 p-3 text-xs text-emerald-300">
            <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Add Admin Form */}
        <form onSubmit={handleAddAdmin} className="space-y-3 rounded-xl border border-slate-800 bg-slate-950 p-4">
          <h3 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
            <UserPlus className="h-4 w-4 text-amber-400" /> + Add Authorized Admin Email
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <input
              type="email"
              placeholder="admin@college.edu"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
              required
            />
            <input
              type="text"
              placeholder="Admin Name (Optional)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-amber-500 p-2.5 font-sports text-xs text-slate-950 font-bold hover:bg-amber-400 disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? 'ADDING EMAIL...' : 'ADD TO AUTHORIZED WHITELIST'}
          </button>
        </form>

        {/* Current Whitelist List */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Current Whitelisted Admins ({admins.length})
          </h3>

          {isLoading ? (
            <div className="p-4 text-center text-xs text-slate-500">Loading admin whitelist...</div>
          ) : admins.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-500">No admin whitelist entries found.</div>
          ) : (
            <div className="divide-y divide-slate-800 rounded-xl border border-slate-800 bg-slate-950 text-xs">
              {admins.map((adm) => (
                <div key={adm.id} className="p-3 flex items-center justify-between gap-3">
                  <div>
                    <span className="block text-slate-200 font-semibold">{adm.email}</span>
                    {adm.name && <span className="text-[11px] text-slate-400">{adm.name}</span>}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleAdmin(adm.id, adm.active)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-bold border transition-colors ${
                      adm.active
                        ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                        : 'border-slate-700 bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Power className="h-3 w-3" />
                    <span>{adm.active ? 'ACTIVE' : 'DISABLED'}</span>
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
