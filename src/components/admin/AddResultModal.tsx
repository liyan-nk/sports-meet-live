import React, { useState, useEffect, useCallback } from 'react';
import type { SportsEvent, Team, ScoringRule } from '../../types/models';
import { resultRepository, eventRepository, teamRepository, scoringRepository } from '../../data/repositories';
import { ModalSheet } from '../common/ModalSheet';
import { PlusCircle, AlertCircle, CheckCircle } from 'lucide-react';

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

  const footerActions = (
    <>
      <button
        type="button"
        onClick={onClose}
        className="h-12 rounded-xl border border-slate-300 bg-white px-6 text-sm font-bold text-slate-800 hover:bg-slate-100"
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="h-12 rounded-xl bg-blue-600 px-6 text-sm font-extrabold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-xs"
      >
        {isSubmitting ? 'Saving...' : 'Save Result'}
      </button>
    </>
  );

  return (
    <ModalSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Record Event Result"
      icon={<PlusCircle className="h-6 w-6 text-blue-600" />}
      footerActions={footerActions}
    >
      {errorMsg && (
        <div className="flex items-start gap-2 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-900 font-bold">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-950 font-bold">
          <CheckCircle className="h-5 w-5 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      <form id="add-result-form" onSubmit={handleSubmit} className="space-y-5">
        {/* Select Event */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-bold text-slate-800">
              Select Event
            </label>
            <button
              type="button"
              onClick={onOpenCreateEvent}
              className="text-xs text-blue-600 hover:underline font-extrabold"
            >
              + Create New Event
            </button>
          </div>
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

        {/* Select Team */}
        <div className="space-y-1.5">
          <label className="block text-sm font-bold text-slate-800">
            Select Team
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

        {/* Participant Name */}
        <div className="space-y-1.5">
          <label className="block text-sm font-bold text-slate-800">
            Participant Name <span className="text-slate-500 font-normal">(optional for team events)</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Liyan (S3 CSE) — Leave blank for team events"
            value={participantName}
            onChange={(e) => setParticipantName(e.target.value)}
            className="w-full h-12 rounded-xl border border-slate-300 bg-white px-4 text-base font-medium text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none"
          />
        </div>

        {/* Position Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-bold text-slate-800">
            Placement Position
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

        {/* Points Preview */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 flex items-center justify-between">
          <div>
            <span className="text-sm font-bold text-slate-900 block">Awarded Points</span>
            <span className="text-xs font-semibold text-slate-500">Auto-calculated from scoring engine</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-blue-600 font-mono tabular-nums">
              +{calculatedPoints}
            </span>
            <span className="text-xs font-extrabold text-slate-500">PTS</span>
          </div>
        </div>
      </form>
    </ModalSheet>
  );
};
