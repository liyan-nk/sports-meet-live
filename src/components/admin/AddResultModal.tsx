import React, { useState, useEffect, useCallback } from 'react';
import type { SportsEvent, Team, ScoringRule } from '../../types/models';
import { resultRepository, eventRepository, teamRepository, scoringRepository } from '../../data/repositories';
import { X, PlusCircle, AlertCircle, CheckCircle } from 'lucide-react';

interface AddResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onOpenCreateEvent: () => void;
}

export const AddResultModal: React.FC<AddResultModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onOpenCreateEvent,
}) => {
  const [events, setEvents] = useState<SportsEvent[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [scoringRules, setScoringRules] = useState<ScoringRule[]>([]);
  
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [participantName, setParticipantName] = useState<string>('');
  const [selectedPosition, setSelectedPosition] = useState<number>(1);
  
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadFormData = useCallback(async () => {
    try {
      const [eventList, teamList, ruleList] = await Promise.all([
        eventRepository.getEvents(),
        teamRepository.getTeams(),
        scoringRepository.getScoringRules(),
      ]);
      setEvents(eventList);
      setTeams(teamList);
      setScoringRules(ruleList);

      if (eventList.length > 0 && !selectedEventId) {
        setSelectedEventId(eventList[0].id);
      }
      if (teamList.length > 0 && !selectedTeamId) {
        setSelectedTeamId(teamList[0].id);
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to load form data');
    }
  }, [selectedEventId, selectedTeamId]);

  useEffect(() => {
    if (isOpen) {
      loadFormData();
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [isOpen, loadFormData]);

  // Calculate points automatically based on selected position
  const activeRule = scoringRules.find(r => r.position === selectedPosition);
  const calculatedPoints = activeRule ? activeRule.points : (selectedPosition === 1 ? 10 : selectedPosition === 2 ? 5 : selectedPosition === 3 ? 3 : 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventId || !selectedTeamId) {
      setErrorMsg('Please select an event and team.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);

      await resultRepository.addResult({
        eventId: selectedEventId,
        teamId: selectedTeamId,
        participantName: participantName.trim() || undefined,
        position: selectedPosition,
        points: calculatedPoints,
      });

      setSuccessMsg('Result recorded successfully!');
      setParticipantName('');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 700);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to submit result.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <PlusCircle className="h-5 w-5 text-amber-500" />
            <h3 className="font-sports text-lg tracking-wide text-white">RECORD EVENT RESULT</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="flex items-start gap-2.5 rounded-lg border border-red-800/60 bg-red-950/40 p-3 text-xs text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-center gap-2 rounded-lg border border-emerald-800/60 bg-emerald-950/40 p-3 text-xs text-emerald-300">
            <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Select Event */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Event
              </label>
              <button
                type="button"
                onClick={onOpenCreateEvent}
                className="text-[11px] text-amber-400 hover:underline font-medium"
              >
                + Create New Event
              </button>
            </div>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2.5 text-sm text-white focus:border-amber-500 focus:outline-none"
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
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Team
            </label>
            <select
              value={selectedTeamId}
              onChange={(e) => setSelectedTeamId(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2.5 text-sm text-white focus:border-amber-500 focus:outline-none"
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
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Participant Name <span className="text-[11px] text-slate-400 font-normal lowercase">(optional for team events)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Liyan Nechikaden (Leave blank for team events)"
              value={participantName}
              onChange={(e) => setParticipantName(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2.5 text-sm text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
            />
          </div>

          {/* Position Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Position
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((pos) => (
                <button
                  key={pos}
                  type="button"
                  onClick={() => setSelectedPosition(pos)}
                  className={`rounded-lg border p-2.5 text-center font-sports text-sm transition-all ${
                    selectedPosition === pos
                      ? 'border-amber-500 bg-amber-500/20 text-amber-400 font-bold'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  {pos === 1 ? '1st Place' : pos === 2 ? '2nd Place' : pos === 3 ? '3rd Place' : '4th Place'}
                </button>
              ))}
            </div>
          </div>

          {/* Points Preview (Calculated automatically from scoring rules) */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-400 block">Awarded Points</span>
              <span className="text-[11px] text-slate-500">Auto-calculated from position #{selectedPosition} rule</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-sports text-3xl font-bold text-amber-400 tabular-nums">
                +{calculatedPoints}
              </span>
              <span className="text-xs font-bold text-slate-400">PTS</span>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-amber-500 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-400 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? 'Saving...' : 'Save Result'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
