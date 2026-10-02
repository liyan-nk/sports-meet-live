import React, { useState, useEffect } from 'react';
import type { Result, Team, SportsEvent, ScoringRule } from '../../types/models';
import { resultRepository } from '../../data/repositories';
import { Edit2, X, AlertCircle, Save } from 'lucide-react';

interface EditResultModalProps {
  isOpen: boolean;
  result: Result | null;
  events: SportsEvent[];
  teams: Team[];
  scoringRules: ScoringRule[];
  onClose: () => void;
  onSuccess: () => void;
}

export const EditResultModal: React.FC<EditResultModalProps> = ({
  isOpen,
  result,
  events,
  teams,
  scoringRules,
  onClose,
  onSuccess,
}) => {
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [participantName, setParticipantName] = useState<string>('');
  const [selectedPosition, setSelectedPosition] = useState<number>(1);
  const [customPoints, setCustomPoints] = useState<number>(10);
  
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

  if (!isOpen || !result) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resultRepository.editResult) {
      alert('Editing results is only supported in Supabase or mock repository.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);

      await resultRepository.editResult(result.id, {
        eventId: selectedEventId,
        teamId: selectedTeamId,
        participantName: participantName.trim() || undefined,
        position: selectedPosition,
        points: customPoints,
      });

      onSuccess();
      onClose();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to update result');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Edit2 className="h-5 w-5 text-amber-500" />
            <h2 className="font-sports text-xl text-white">EDIT EVENT RESULT</h2>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 rounded-lg border border-red-800/60 bg-red-950/40 p-3 text-xs text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Select Event */}
          <div>
            <label className="block text-slate-300 font-semibold uppercase tracking-wider mb-1">
              Select Event
            </label>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-white focus:border-amber-500 focus:outline-none"
              required
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.name} ({ev.category})
                </option>
              ))}
            </select>
          </div>

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

          {/* Participant Name (Optional for team events) */}
          <div>
            <label className="block text-slate-300 font-semibold uppercase tracking-wider mb-1 font-mono">
              Participant Name <span className="text-[10px] text-slate-400 font-normal lowercase">(optional for team events)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Liyan Nechikaden (Leave blank for team events)"
              value={participantName}
              onChange={(e) => setParticipantName(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
            />
          </div>

          {/* Position Placement */}
          <div>
            <label className="block text-slate-300 font-semibold uppercase tracking-wider mb-1.5">
              Awarded Position Rank
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((pos) => (
                <button
                  key={pos}
                  type="button"
                  onClick={() => setSelectedPosition(pos)}
                  className={`rounded-xl border p-2.5 font-sports text-sm transition-all ${
                    selectedPosition === pos
                      ? 'border-amber-500 bg-amber-500/20 text-amber-400 font-bold'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  #{pos} Place
                </button>
              ))}
            </div>
          </div>

          {/* Points Breakdown */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 flex items-center justify-between">
            <span className="text-slate-400 font-medium">Points to Award:</span>
            <span className="font-sports text-lg text-amber-400">{customPoints} PTS</span>
          </div>

          {/* Submit Actions */}
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
              <Save className="h-4 w-4" />
              <span>{isSubmitting ? 'SAVING...' : 'SAVE CHANGES'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
