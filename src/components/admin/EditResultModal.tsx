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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl border border-slate-300 bg-white p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2">
            <Edit2 className="h-6 w-6 text-blue-600" />
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Edit Recorded Result</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {errorMsg && (
          <div className="flex items-start gap-2 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-900 font-bold">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-slate-800">
              Event
            </label>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full h-12 rounded-xl border border-slate-300 bg-slate-50 px-4 text-base font-semibold text-slate-900 focus:border-blue-600 focus:outline-none"
              required
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.name} ({ev.category})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-slate-800">
              Team
            </label>
            <select
              value={selectedTeamId}
              onChange={(e) => setSelectedTeamId(e.target.value)}
              className="w-full h-12 rounded-xl border border-slate-300 bg-slate-50 px-4 text-base font-semibold text-slate-900 focus:border-blue-600 focus:outline-none"
              required
            >
              {teams.map((tm) => (
                <option key={tm.id} value={tm.id}>
                  {tm.name} ({tm.code})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-slate-800">
              Participant Name
            </label>
            <input
              type="text"
              placeholder="e.g. Liyan (S3 CSE) — Leave blank for team events"
              value={participantName}
              onChange={(e) => setParticipantName(e.target.value)}
              className="w-full h-12 rounded-xl border border-slate-300 bg-white px-4 text-base font-medium text-slate-900 focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-800">
              Position & Points
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((pos) => (
                <button
                  key={pos}
                  type="button"
                  onClick={() => setSelectedPosition(pos)}
                  className={`h-12 rounded-xl border text-sm font-extrabold transition-all ${
                    selectedPosition === pos
                      ? 'border-blue-600 bg-blue-600 text-white shadow-xs'
                      : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {pos === 1 ? '🥇 1st' : pos === 2 ? '🥈 2nd' : pos === 3 ? '🥉 3rd' : '4th'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="h-12 rounded-xl border border-slate-300 bg-white px-6 text-sm font-bold text-slate-800 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-12 rounded-xl bg-blue-600 px-6 text-sm font-extrabold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-xs"
            >
              {isSubmitting ? 'Updating...' : 'Update Result'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
