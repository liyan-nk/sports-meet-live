import React, { useState, useEffect } from 'react';
import type { Result, SportsEvent, Team } from '../types/models';
import { resultRepository, eventRepository, standingsRepository } from '../data/repositories';
import { Trophy, Award, RefreshCw, AlertCircle } from 'lucide-react';

export const ResultsPage: React.FC = () => {
  const [results, setResults] = useState<Result[]>([]);
  const [events, setEvents] = useState<SportsEvent[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const loadResultsData = async () => {
    try {
      setError(null);
      const [resultsList, eventsList, standingsList] = await Promise.all([
        resultRepository.getResults(),
        eventRepository.getEvents(),
        standingsRepository.getStandings(),
      ]);
      setResults(resultsList);
      setEvents(eventsList);
      setTeams(standingsList.map((s) => s.team));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load event results'));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadResultsData();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadResultsData();
  };

  const getTeamName = (teamId: string): string => {
    const found = teams.find((t) => t.id === teamId);
    if (found) return found.name;
    return teamId.replace('team-', '').replace('-', ' ').toUpperCase();
  };

  // Group results by eventId
  const resultsByEvent = events.map((event) => {
    const eventResults = results
      .filter((r) => r.eventId === event.id)
      .sort((a, b) => a.position - b.position);
    return {
      event,
      results: eventResults,
    };
  }).filter((group) => group.results.length > 0);

  // Also catch results whose event might not be in event list
  const knownEventIds = new Set(events.map((e) => e.id));
  const orphanResults = results.filter((r) => !knownEventIds.has(r.eventId));
  if (orphanResults.length > 0) {
    resultsByEvent.push({
      event: { id: 'unknown', name: 'Other Events', category: 'Athletics', status: 'completed', createdAt: new Date().toISOString() },
      results: orphanResults.sort((a, b) => a.position - b.position),
    });
  }

  const getMedalBadge = (position: number) => {
    switch (position) {
      case 1:
        return <span className="text-xl" title="1st Place">🥇</span>;
      case 2:
        return <span className="text-xl" title="2nd Place">🥈</span>;
      case 3:
        return <span className="text-xl" title="3rd Place">🥉</span>;
      default:
        return <span className="font-sports text-xs text-slate-400">#{position}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-amber-500" />
            <h1 className="font-sports text-2xl tracking-wide text-white">EVENT RESULTS</h1>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Official recorded placements and team points per event.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-28 animate-pulse rounded-xl bg-slate-900 border border-slate-800" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-800/50 bg-red-950/20 p-6 text-center text-red-300">
          <AlertCircle className="mx-auto h-8 w-8 mb-2 text-red-400" />
          <h3 className="font-sports text-lg">Unable to load event results</h3>
          <p className="text-xs text-red-400 mt-1">{error.message}</p>
        </div>
      ) : resultsByEvent.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-12 text-center">
          <Award className="mx-auto h-12 w-12 text-slate-600 mb-3" />
          <h3 className="font-sports text-xl text-white">NO RESULTS RECORDED YET</h3>
          <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto">
            Results will appear here in real-time as events are completed and validated by sports meet officials.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {resultsByEvent.map(({ event, results: eventRes }) => (
            <div
              key={event.id}
              className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5 space-y-3"
            >
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                <div>
                  <h3 className="font-sports text-lg text-white">{event.name}</h3>
                  {event.category && (
                    <span className="text-[10px] font-mono uppercase text-slate-500">
                      {event.category}
                    </span>
                  )}
                </div>
                <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-400 uppercase">
                  {event.status || 'Completed'}
                </span>
              </div>

              <div className="space-y-2">
                {eventRes.map((res) => (
                  <div
                    key={res.id}
                    className="flex items-center justify-between rounded-lg border border-slate-800/60 bg-slate-950/60 p-2.5 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center shrink-0">
                        {getMedalBadge(res.position)}
                      </div>
                      <div>
                        {res.participantName ? (
                          <>
                            <div className="font-sports text-base text-white">{res.participantName}</div>
                            <div className="text-xs text-amber-400 font-semibold">{getTeamName(res.teamId)}</div>
                          </>
                        ) : (
                          <div className="font-sports text-base text-white">{getTeamName(res.teamId)}</div>
                        )}
                        <div className="text-[10px] text-slate-500 font-mono">
                          Position #{res.position}
                        </div>
                      </div>
                    </div>

                    <div className="font-sports text-base text-amber-400 tabular-nums">
                      +{res.points} <span className="text-xs text-slate-400">PTS</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
