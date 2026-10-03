import React, { useState, useEffect } from 'react';
import type { Result, SportsEvent, Team, ScoringRule } from '../../types/models';
import { resultRepository } from '../../data/repositories';
import { X, Edit2, AlertCircle } from 'lucide-react';

interface EditResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  result: Result | null;
  events: SportsEvent[];
  teams: Team[];
  scoringRules: ScoringRule[];
}

export const EditResultModal: React.FC<EditResultModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  result,
  events,
  teams,
  scoringRules,
}) => {
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [participantName, setParticipantName] = useState<string>('');
  const [selectedPosition, setSelectedPosition] = useState<number>(1);
  const [customPoints, setCustomPoints] = useState<number>(0);
  
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (result && isOpen) {
      setSelectedEventId(result.eventId);
      setSelectedTeamId(result.teamId);
      setParticipantName(result.participantName || '');
      setSelectedPosition(result.position);
      setCustomPoints(result.points ?? 0);
      setErrorMsg(null);
    }
  }, [result, isOpen]);

  useEffect(() => {
    const rule = scoringRules.find(r => r.position === selectedPosition);
    if (rule) {
      setCustomPoints(rule.points);
    }
  }, [selectedPosition, scoringRules]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!result || !selectedEventId || !selectedTeamId) return;

    try {
      setIsSubmitting(true);
      setErrorMsg(null);

      if (resultRepository.editResult) {
        await resultRepository.editResult(result.id, {
          eventId: selectedEventId,
          teamId: selectedTeamId,
          participantName: participantName.trim() || undefined,
          position: selectedPosition,
          points: Number(customPoints),
        });
      }

      onSuccess();
      onClose();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to update result');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !result) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xl space-y-4">
        
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Edit2 className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">Edit Recorded Result</h3>
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
              Event
            </label>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-sm font-semibold text-slate-900 focus:border-blue-600 focus:outline-none shadow-xs"
              required
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.name} ({ev.category})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Team
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
              Participant Name
            </label>
            <input
              type="text"
              placeholder="e.g. Liyan (S3 CSE) — Leave blank for team events"
              value={participantName}
              onChange={(e) => setParticipantName(e.target.value)}
              className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none shadow-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Position & Points
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((pos) => (
                <button
                  key={pos}
                  type="button"
                  onClick={() => setSelectedPosition(pos)}
                  className={`h-11 rounded-xl border text-xs font-bold transition-all ${
                    selectedPosition === pos
                      ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-xs'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {pos === 1 ? '🥇 1st' : pos === 2 ? '🥈 2nd' : pos === 3 ? '🥉 3rd' : '4th'}
                </button>
              ))}
            </div>
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
              {isSubmitting ? 'Updating...' : 'Update Result'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
