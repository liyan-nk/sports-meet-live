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

  const getMedalBadge = (position: number) => {
    switch (position) {
      case 1:
        return <span className="inline-flex items-center justify-center h-7 w-7 rounded-lg bg-amber-100 border border-amber-300 text-xs font-bold text-amber-900">🥇 1st</span>;
      case 2:
        return <span className="inline-flex items-center justify-center h-7 w-7 rounded-lg bg-slate-100 border border-slate-300 text-xs font-bold text-slate-800">🥈 2nd</span>;
      case 3:
        return <span className="inline-flex items-center justify-center h-7 w-7 rounded-lg bg-orange-100 border border-orange-300 text-xs font-bold text-orange-900">🥉 3rd</span>;
      default:
        return <span className="inline-flex items-center justify-center h-7 w-7 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-600">#{position}</span>;
    }
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-blue-600" />
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Results</h1>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            Official recorded placements and team points per event.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          className="flex items-center gap-1.5 self-start sm:self-auto rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Sync</span>
        </button>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => {
          const active = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                active
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-36 animate-pulse rounded-2xl bg-white border border-slate-200" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-900">
          <AlertCircle className="mx-auto h-7 w-7 mb-2 text-red-600" />
          <h3 className="text-base font-bold">Couldn't load results</h3>
          <p className="text-xs text-red-700 mt-1">{error.message}</p>
          <button
            onClick={handleRefresh}
            className="mt-3 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      ) : resultsByEvent.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
          <Award className="mx-auto h-10 w-10 text-slate-400 mb-2" />
          <h3 className="text-base font-bold text-slate-900">No results recorded</h3>
          <p className="mt-1 text-xs text-slate-500">
            Results will appear here as events are completed by officials.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {resultsByEvent.map(({ event, results: eventRes }) => (
            <div
              key={event.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col justify-between"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 leading-tight">{event.name}</h3>
                  <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">
                    {event.category || 'Track'}
                  </span>
                </div>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                  {event.status || 'Completed'}
                </span>
              </div>

              <div className="space-y-2">
                {eventRes.map((res) => {
                  const teamName = getTeamName(res.teamId);
                  return (
                    <div
                      key={res.id}
                      className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-2.5"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        {getMedalBadge(res.position)}
                        <div className="truncate">
                          {res.participantName ? (
                            <>
                              <div className="text-xs font-bold text-slate-900 truncate">{res.participantName}</div>
                              <div className="text-[11px] font-semibold text-slate-500 truncate">{teamName}</div>
                            </>
                          ) : (
                            <div className="text-xs font-bold text-slate-900 truncate">{teamName}</div>
                          )}
                        </div>
                      </div>

                      <div className="font-mono text-xs font-black text-slate-900 shrink-0 ml-2">
                        +{res.points} <span className="text-[10px] text-slate-500">PTS</span>
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
