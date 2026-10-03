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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xl space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <PlusCircle className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">Record Event Result</h3>
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

        {successMsg && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
            <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Select Event */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Event
              </label>
              <button
                type="button"
                onClick={onOpenCreateEvent}
                className="text-xs text-blue-600 hover:underline font-bold"
              >
                + Create New Event
              </button>
            </div>
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

          {/* Select Team */}
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

          {/* Participant Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Participant Name <span className="text-slate-400 font-normal lowercase">(optional for team events)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Liyan (S3 CSE) — Leave blank for team events"
              value={participantName}
              onChange={(e) => setParticipantName(e.target.value)}
              className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none shadow-xs"
            />
          </div>

          {/* Position Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Position
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

          {/* Points Preview */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-900 block">Awarded Points</span>
              <span className="text-[11px] text-slate-500">Auto-calculated from position #{selectedPosition} rule</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-blue-600 font-mono tabular-nums">
                +{calculatedPoints}
              </span>
              <span className="text-xs font-bold text-slate-500">PTS</span>
            </div>
          </div>

          {/* Submit Action */}
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
              {isSubmitting ? 'Saving...' : 'Save Result'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
