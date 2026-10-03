import React, { useState } from 'react';
import type { Team } from '../../types/models';
import { adjustmentRepository } from '../../data/repositories';
import { X, SlidersHorizontal, AlertCircle } from 'lucide-react';

interface StandingsAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  teams: Team[];
}

export const StandingsAdjustmentModal: React.FC<StandingsAdjustmentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  teams,
}) => {
  const [selectedTeamId, setSelectedTeamId] = useState<string>(teams[0]?.id || '');
  const [points, setPoints] = useState<number>(0);
  const [reason, setReason] = useState<string>('Initial standings — pre-system results');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeamId || !reason.trim()) {
      setErrorMsg('Team and reason are required.');
      return;
    }

    if (!adjustmentRepository?.createAdjustment) {
      alert('Adjustment repository not supported.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);

      await adjustmentRepository.createAdjustment({
        teamId: selectedTeamId,
        points: Number(points),
        reason: reason.trim(),
      });

      onSuccess();
      onClose();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to add adjustment');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xl space-y-4">
        
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">Starting Points Adjustment</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Select Team
            </label>
            <select
              value={selectedTeamId}
              onChange={(e) => setSelectedTeamId(e.target.value)}
              className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-sm font-semibold text-slate-900 focus:border-blue-600 focus:outline-none shadow-xs"
              required
            >
              {teams.map((tm) => (
                <option key={tm.id} value={tm.id}>
                  {tm.name} ({tm.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Points Adjustment (+ or -)
            </label>
            <input
              type="number"
              value={points}
              onChange={(e) => setPoints(Number(e.target.value))}
              className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold font-mono text-slate-900 focus:border-blue-600 focus:outline-none shadow-xs"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Reason / Description
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Initial standings — pre-system results"
              className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-blue-600 focus:outline-none shadow-xs"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-11 rounded-xl bg-blue-600 px-5 text-xs font-extrabold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-xs"
            >
              {isSubmitting ? 'Saving...' : 'Save Adjustment'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
