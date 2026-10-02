import React, { useState } from 'react';
import type { Team } from '../../types/models';
import { adjustmentRepository } from '../../data/repositories';
import { ShieldAlert, X, AlertCircle, Plus } from 'lucide-react';

interface StandingsAdjustmentModalProps {
  isOpen: boolean;
  teams: Team[];
  onClose: () => void;
  onSuccess: () => void;
}

export const StandingsAdjustmentModal: React.FC<StandingsAdjustmentModalProps> = ({
  isOpen,
  teams,
  onClose,
  onSuccess,
}) => {
  const [selectedTeamId, setSelectedTeamId] = useState<string>(teams[0]?.id || 'team-vertex');
  const [points, setPoints] = useState<number>(0);
  const [reason, setReason] = useState<string>('Starting Points — Pre-System Carryover');
  
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setErrorMsg('Please specify a reason for this standings adjustment.');
      return;
    }

    if (!adjustmentRepository.createAdjustment) {
      alert('Creating adjustments is only supported in Supabase or mock repository.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);

      await adjustmentRepository.createAdjustment({
        teamId: selectedTeamId,
        points: parseInt(points as any, 10) || 0,
        reason: reason.trim(),
      });

      onSuccess();
      onClose();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to record standings adjustment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl border border-amber-500/40 bg-slate-900 p-6 shadow-2xl space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-amber-500" />
            <div>
              <h2 className="font-sports text-lg text-white">RECORD STARTING POINTS / ADJUSTMENT</h2>
              <p className="text-[11px] text-slate-400">Explicit Auditable Standings Adjustment</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-xs text-slate-400">
          Standings Adjustments represent pre-system starting points or official committee penalty/bonus points. They are <strong>NOT</strong> event results.
        </p>

        {errorMsg && (
          <div className="flex items-center gap-2 rounded-lg border border-red-800/60 bg-red-950/40 p-3 text-xs text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Select Team */}
          <div>
            <label className="block text-slate-300 font-semibold uppercase tracking-wider mb-1">
              Select Team
            </label>
            <select
              value={selectedTeamId}
              onChange={(e) => setSelectedTeamId(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-white focus:border-amber-500 focus:outline-none"
              required
            >
              {teams.map((tm) => (
                <option key={tm.id} value={tm.id}>
                  {tm.name} ({tm.code})
                </option>
              ))}
            </select>
          </div>

          {/* Points Adjustment */}
          <div>
            <label className="block text-slate-300 font-semibold uppercase tracking-wider mb-1">
              Points Adjustment (+ or -)
            </label>
            <input
              type="number"
              value={points}
              onChange={(e) => setPoints(parseInt(e.target.value, 10))}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-white focus:border-amber-500 focus:outline-none font-mono"
              required
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Enter positive integer for starting points or bonus, negative integer for penalty.
            </p>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-slate-300 font-semibold uppercase tracking-wider mb-1">
              Audit Reason / Description
            </label>
            <input
              type="text"
              placeholder="e.g. Initial Standings Carryover or Penalty for Disqualification"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
              required
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-5 py-2.5 font-sports text-sm text-slate-950 hover:bg-amber-400 active:scale-98 disabled:opacity-50 transition-all font-bold shadow-lg"
            >
              <Plus className="h-4 w-4 stroke-[3]" />
              <span>{isSubmitting ? 'RECORDING...' : 'RECORD ADJUSTMENT'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
