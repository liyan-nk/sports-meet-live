import React, { useState, useEffect } from 'react';
import type { Result, SportsEvent, Team } from '../types/models';
import { resultRepository, eventRepository, standingsRepository } from '../data/repositories';
import { Award, RefreshCw, AlertCircle } from 'lucide-react';

export const ResultsPage: React.FC = () => {
  const [results, setResults] = useState<Result[]>([]);
  const [events, setEvents] = useState<SportsEvent[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
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

  const categories = ['All', 'Track', 'Field', 'Indoor', 'Team Sport'];

  const getTeamName = (teamId: string): string => {
    const found = teams.find((t) => t.id === teamId);
    if (found) return found.name;
    return teamId.replace('team-', '').replace('-', ' ').toUpperCase();
  };

  // Group results by eventId
  const resultsByEvent = events
    .filter(event => {
      if (selectedCategory === 'All') return true;
      return (event.category || '').toLowerCase() === selectedCategory.toLowerCase();
    })
    .map((event) => {
      const eventResults = results
        .filter((r) => r.eventId === event.id)
        .sort((a, b) => a.position - b.position);
      return {
        event,
        results: eventResults,
      };
    })
    .filter((group) => group.results.length > 0);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <Award className="h-6 w-6 text-blue-600 shrink-0" />
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">RESULTS SHEET</h1>
          </div>
          <p className="mt-1 text-sm sm:text-base font-medium text-slate-500">
            Official recorded placements and team points per event.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 self-start sm:self-auto rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-800 hover:bg-slate-100 transition-colors shadow-xs"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Sync</span>
        </button>
      </div>

      {/* Visually Quiet Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {categories.map((cat) => {
          const active = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`shrink-0 rounded-xl px-4 py-2 text-sm font-extrabold transition-colors ${
                active
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="space-y-6 py-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-32 w-full animate-pulse bg-slate-200/60 rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-300 bg-red-50 p-6 text-center text-red-900">
          <AlertCircle className="mx-auto h-8 w-8 mb-2 text-red-600" />
          <h3 className="text-lg font-bold">Couldn't load results sheet</h3>
          <p className="text-sm text-red-700 mt-1">{error.message}</p>
          <button
            onClick={handleRefresh}
            className="mt-4 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      ) : resultsByEvent.length === 0 ? (
        <div className="py-12 text-center border-t border-b border-slate-200">
          <Award className="mx-auto h-10 w-10 text-slate-400 mb-2" />
          <h3 className="text-lg font-bold text-slate-900">No results published</h3>
          <p className="mt-1 text-sm text-slate-500">
            Official placements will appear here as events finish.
          </p>
        </div>
      ) : (
        /* Sports Results Sheet Grouped by Event */
        <div className="space-y-10 divide-y divide-slate-200">
          {resultsByEvent.map(({ event, results: eventRes }) => (
            <div key={event.id} className="pt-8 first:pt-0 space-y-4">
              {/* Event Header */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-black text-slate-900 leading-tight">
                      {event.name}
                    </h2>
                    <span className="rounded-md bg-blue-100 px-2.5 py-0.5 text-xs font-black text-blue-900 uppercase">
                      {event.category || 'Track'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Placement Rows (Clean Sports Sheet) */}
              <div className="divide-y divide-slate-100 border-t border-b border-slate-200">
                {eventRes.map((res) => {
                  const teamName = getTeamName(res.teamId);
                  return (
                    <div
                      key={res.id}
                      className="flex items-center justify-between py-3.5 px-2 hover:bg-slate-100/40 transition-colors"
                    >
                      <div className="flex items-center gap-3.5 min-w-0 pr-4">
                        <span className={`inline-flex items-center justify-center h-9 w-9 rounded-xl text-sm font-black shrink-0 ${
                          res.position === 1 ? 'bg-amber-400 text-amber-950' :
                          res.position === 2 ? 'bg-slate-200 text-slate-800' :
                          'bg-amber-100 text-amber-900'
                        }`}>
                          {res.position === 1 ? '🥇' : res.position === 2 ? '🥈' : '🥉'}
                        </span>

                        <div className="min-w-0">
                          {res.participantName ? (
                            <>
                              <div className="text-base sm:text-lg font-extrabold text-slate-900 truncate">
                                {res.participantName}
                              </div>
                              <div className="text-sm font-semibold text-slate-500 truncate">
                                {teamName}
                              </div>
                            </>
                          ) : (
                            <div className="text-base sm:text-lg font-extrabold text-slate-900 truncate">
                              {teamName}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono tabular-nums">
                          +{res.points}
                        </span>
                        <span className="text-xs font-bold text-slate-500 block uppercase">
                          PTS
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
