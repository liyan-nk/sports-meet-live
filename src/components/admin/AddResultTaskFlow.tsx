import React, { useState, useEffect, useCallback } from 'react';
import type { SportsEvent, Team, ScoringRule } from '../../types/models';
import { resultRepository, eventRepository, teamRepository, scoringRepository } from '../../data/repositories';
import { Trophy, ArrowRight, ArrowLeft, CheckCircle, AlertCircle, X } from 'lucide-react';

interface AddResultTaskFlowProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onOpenCreateEvent: () => void;
}

export const AddResultTaskFlow: React.FC<AddResultTaskFlowProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onOpenCreateEvent,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [events, setEvents] = useState<SportsEvent[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [scoringRules, setScoringRules] = useState<ScoringRule[]>([]);

  // Selected values
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
      setErrorMsg(err instanceof Error ? err.message : 'Failed to load data.');
    }
  }, [selectedEventId, selectedTeamId]);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      loadFormData();
      setErrorMsg(null);
      setSuccessMsg(null);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, loadFormData]);

  if (!isOpen) return null;

  const selectedEvent = events.find((e) => e.id === selectedEventId);
  const selectedTeam = teams.find((t) => t.id === selectedTeamId);

  const activeRule = scoringRules.find((r) => r.position === selectedPosition);
  const calculatedPoints = activeRule
    ? activeRule.points
    : selectedPosition === 1
    ? 10
    : selectedPosition === 2
    ? 5
    : selectedPosition === 3
    ? 3
    : 0;

  const handlePublish = async () => {
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

      setSuccessMsg('Result published successfully!');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 600);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to publish result.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex flex-col bg-slate-50 text-slate-900 overflow-hidden"
    >
      {/* Top Bar Header */}
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-8 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
              Record Event Result
            </h2>
          </div>
        </div>

        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
          Step {step} of 3
        </span>
      </header>

      {/* Main Task Body */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-2xl mx-auto w-full space-y-6">
        {errorMsg && (
          <div className="flex items-start gap-2.5 rounded-xl border border-red-300 bg-red-50 p-4 text-sm font-bold text-red-900">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-center gap-2.5 rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-sm font-bold text-emerald-950">
            <CheckCircle className="h-5 w-5 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* STEP 1: SELECT EVENT */}
        {step === 1 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-blue-600 block mb-1">
                Step 1: Choose Competition Event
              </span>
              <h3 className="text-xl font-black text-slate-900">Which event are you recording?</h3>
              <p className="text-sm font-medium text-slate-500 mt-1">
                Select an existing scheduled event or add a new event to today's meet schedule.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-slate-800">Scheduled Event</label>
                <button
                  type="button"
                  onClick={onOpenCreateEvent}
                  className="text-xs font-extrabold text-blue-600 hover:underline"
                >
                  + Create New Event
                </button>
              </div>

              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="w-full h-14 rounded-xl border border-slate-300 bg-white px-4 text-base font-bold text-slate-900 focus:border-blue-600 focus:outline-none shadow-xs"
              >
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.name} ({ev.category})
                  </option>
                ))}
              </select>
            </div>

            {selectedEvent && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-2 shadow-xs">
                <span className="text-xs font-black uppercase tracking-wider text-blue-900 bg-blue-100 px-2.5 py-1 rounded-md">
                  {selectedEvent.category}
                </span>
                <h4 className="text-xl font-black text-slate-900">{selectedEvent.name}</h4>
                <p className="text-xs font-semibold text-slate-500">
                  Status: {selectedEvent.status === 'completed' ? 'Completed' : 'Scheduled Today'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: SELECT PODIUM WINNER & TEAM */}
        {step === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-blue-600 block mb-1">
                Step 2: Winner Placement & Points
              </span>
              <h3 className="text-xl font-black text-slate-900">Enter placement and participating team</h3>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-bold text-slate-800 block">Placement Position</label>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((pos) => (
                  <button
                    key={pos}
                    type="button"
                    onClick={() => setSelectedPosition(pos)}
                    className={`h-14 rounded-xl border text-sm font-black transition-all ${
                      selectedPosition === pos
                        ? 'border-blue-600 bg-blue-600 text-white shadow-xs'
                        : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    {pos === 1 ? '🥇 1st' : pos === 2 ? '🥈 2nd' : pos === 3 ? '🥉 3rd' : '4th'}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-800 block">Participating House / Team</label>
              <select
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                className="w-full h-14 rounded-xl border border-slate-300 bg-white px-4 text-base font-bold text-slate-900 focus:border-blue-600 focus:outline-none shadow-xs"
              >
                {teams.map((tm) => (
                  <option key={tm.id} value={tm.id}>
                    {tm.name} ({tm.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-800 block">
                Athlete Name <span className="text-slate-500 font-normal">(Optional for relay/team events)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Liyan Koya (S3 CSE)"
                value={participantName}
                onChange={(e) => setParticipantName(e.target.value)}
                className="w-full h-14 rounded-xl border border-slate-300 bg-white px-4 text-base font-medium text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none shadow-xs"
              />
            </div>

            <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-4 flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-blue-900 block">Calculated Standing Points</span>
                <span className="text-xs font-semibold text-blue-700">Official tournament rules</span>
              </div>
              <span className="text-3xl font-black text-blue-800 font-mono tabular-nums">
                +{calculatedPoints} PTS
              </span>
            </div>
          </div>
        )}

        {/* STEP 3: REVIEW & PUBLISH */}
        {step === 3 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-600 block mb-1">
                Step 3: Final Review
              </span>
              <h3 className="text-xl font-black text-slate-900">Review & Publish Official Outcome</h3>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-xs">
              <div className="border-b border-slate-100 pb-3">
                <span className="text-xs font-bold text-slate-500 uppercase">Event</span>
                <h4 className="text-lg font-black text-slate-900">{selectedEvent?.name}</h4>
              </div>

              <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase">Placement</span>
                  <div className="text-base font-black text-slate-900">
                    {selectedPosition === 1 ? '🥇 1st Place' : selectedPosition === 2 ? '🥈 2nd Place' : selectedPosition === 3 ? '🥉 3rd Place' : '4th Place'}
                  </div>
                </div>
                <span className="text-2xl font-black text-blue-600 font-mono tabular-nums">
                  +{calculatedPoints} PTS
                </span>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-500 uppercase">Winner Details</span>
                <div className="text-base font-black text-slate-900">{selectedTeam?.name}</div>
                {participantName && (
                  <div className="text-sm font-semibold text-slate-600">{participantName}</div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Sticky Bottom Action Bar */}
      <footer className="sticky bottom-0 z-10 border-t border-slate-200 bg-white p-4 sm:px-8 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-lg">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s - 1) as 1 | 2)}
              className="h-12 px-5 rounded-xl border border-slate-300 bg-white text-sm font-extrabold text-slate-800 hover:bg-slate-100 flex items-center gap-1.5"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="h-12 px-5 rounded-xl border border-slate-300 bg-white text-sm font-extrabold text-slate-800 hover:bg-slate-100"
            >
              Cancel
            </button>
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s + 1) as 2 | 3)}
              className="h-12 px-6 rounded-xl bg-blue-600 text-sm font-extrabold text-white hover:bg-blue-700 flex items-center gap-2 shadow-xs ml-auto"
            >
              Next <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handlePublish}
              disabled={isSubmitting}
              className="h-12 px-6 rounded-xl bg-emerald-600 text-sm font-extrabold text-white hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2 shadow-xs ml-auto"
            >
              {isSubmitting ? 'Publishing...' : 'Publish Result & Update Standings'}
            </button>
          )}
        </div>
      </footer>
    </div>
  );
};
