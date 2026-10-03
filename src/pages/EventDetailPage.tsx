import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { SportsEvent, Result, Team } from '../types/models';
import { eventRepository, resultRepository, standingsRepository } from '../data/repositories';
import { ArrowLeft, Trophy, Calendar, AlertCircle } from 'lucide-react';

export const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [eventObj, setEventObj] = useState<SportsEvent | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [teams, setTeams] = useState<Record<string, Team>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const loadEventDetail = useCallback(async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      setError(null);
      const [eventsList, resultsList, standingsList] = await Promise.all([
        eventRepository.getEvents(),
        resultRepository.getResults(),
        standingsRepository.getStandings(),
      ]);

      const ev = eventsList.find((e) => e.id === id);
      if (!ev) {
        throw new Error('Event not found.');
      }

      const teamMap: Record<string, Team> = {};
      standingsList.forEach((s) => {
        teamMap[s.team.id] = s.team;
      });

      const eventResults = resultsList
        .filter((r) => r.eventId === id)
        .sort((a, b) => a.position - b.position);

      setEventObj(ev);
      setResults(eventResults);
      setTeams(teamMap);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load event details'));
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadEventDetail();
  }, [loadEventDetail]);

  if (isLoading) {
    return (
      <div className="space-y-6 py-6">
        <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />
        <div className="h-40 w-full animate-pulse rounded-2xl bg-slate-200" />
      </div>
    );
  }

  if (error || !eventObj) {
    return (
      <div className="rounded-2xl border border-red-300 bg-red-50 p-6 text-center text-red-900 space-y-4">
        <AlertCircle className="mx-auto h-8 w-8 text-red-600" />
        <h3 className="text-xl font-extrabold">{error?.message || 'Event Not Found'}</h3>
        <Link
          to="/events"
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-slate-800"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Schedule
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Back Navigation */}
      <Link
        to="/events"
        className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Events Schedule</span>
      </Link>

      {/* Hero Event Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 space-y-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <span className="rounded-md bg-blue-100 px-3 py-1 text-xs font-black text-blue-900 uppercase tracking-wide">
            {eventObj.category || 'Track Event'}
          </span>
          <span className="text-sm font-semibold text-slate-500 flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-slate-400" />
            Status: {eventObj.status === 'completed' ? 'Final Outcome' : 'Scheduled Today'}
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          {eventObj.name}
        </h1>
      </div>

      {/* Official Podium Results */}
      <section className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
          <Trophy className="h-6 w-6 text-amber-500" />
          <span>Official Podium Placements</span>
        </h2>

        {results.length === 0 ? (
          <p className="py-6 text-base text-slate-500 border-t border-b border-slate-200">
            No results recorded yet for this event.
          </p>
        ) : (
          <div className="divide-y divide-slate-200 border-t border-b border-slate-200">
            {results.map((res) => {
              const tm = teams[res.teamId];
              return (
                <div
                  key={res.id}
                  className="flex items-center justify-between py-5 px-2 hover:bg-slate-100/40 transition-colors"
                >
                  <div className="flex items-center gap-4 min-w-0 pr-4">
                    <span
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg font-black ${
                        res.position === 1
                          ? 'bg-amber-400 text-amber-950 shadow-xs'
                          : res.position === 2
                          ? 'bg-slate-200 text-slate-800'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {res.position === 1 ? '🥇' : res.position === 2 ? '🥈' : '🥉'}
                    </span>

                    <div className="min-w-0">
                      <div className="text-lg sm:text-xl font-black text-slate-900 leading-tight truncate">
                        {res.participantName || tm?.name || 'Team Event'}
                      </div>
                      {tm && (
                        <div className="text-sm font-semibold text-slate-500">
                          {tm.name} ({tm.code})
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tabular-nums">
                      +{res.points}
                    </span>
                    <span className="text-xs font-bold text-slate-500 block uppercase">PTS</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
