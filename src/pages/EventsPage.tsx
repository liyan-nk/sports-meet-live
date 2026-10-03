import React, { useState, useEffect } from 'react';
import type { SportsEvent, Result } from '../types/models';
import { eventRepository, resultRepository, teamRepository } from '../data/repositories';
import { Calendar, RefreshCw, AlertCircle, CheckCircle2, PlayCircle, Clock } from 'lucide-react';

export const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<SportsEvent[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [teams, setTeams] = useState<Record<string, string>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const loadData = async () => {
    try {
      setError(null);
      const [eventsList, resultsList, teamsList] = await Promise.all([
        eventRepository.getEvents(),
        resultRepository.getResults(),
        teamRepository.getTeams(),
      ]);

      const teamMap: Record<string, string> = {};
      teamsList.forEach(t => { teamMap[t.id] = t.name; });

      setEvents(eventsList);
      setResults(resultsList);
      setTeams(teamMap);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load events schedule'));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadData();
  };

  const categories = ['All', 'Track', 'Field', 'Indoor', 'Team Sport'];

  const filteredEvents = events.filter(e => {
    if (selectedCategory === 'All') return true;
    return (e.category || '').toLowerCase() === selectedCategory.toLowerCase();
  });

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'in_progress':
      case 'live':
      case 'ongoing':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-900 border border-emerald-300">
            <PlayCircle className="h-4 w-4 text-emerald-600 animate-pulse" /> LIVE NOW
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 border border-slate-300">
            <CheckCircle2 className="h-4 w-4 text-slate-600" /> COMPLETED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900 border border-amber-300">
            <Clock className="h-4 w-4 text-amber-600" /> UPCOMING
          </span>
        );
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="h-6 w-6 text-blue-600 shrink-0" />
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">EVENTS SCHEDULE</h1>
          </div>
          <p className="mt-1 text-sm sm:text-base font-medium text-slate-500">
            Official sports meet competition schedule and event details.
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

      {/* Loading & State Handler */}
      {isLoading ? (
        <div className="space-y-4 py-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-24 w-full animate-pulse bg-slate-200/60 rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-300 bg-red-50 p-6 text-center text-red-900">
          <AlertCircle className="mx-auto h-8 w-8 mb-2 text-red-600" />
          <h3 className="text-lg font-bold">Couldn't load events schedule</h3>
          <p className="text-sm text-red-700 mt-1">{error.message}</p>
          <button
            onClick={handleRefresh}
            className="mt-4 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="py-12 text-center border-t border-b border-slate-200">
          <Calendar className="mx-auto h-10 w-10 text-slate-400 mb-2" />
          <h3 className="text-lg font-bold text-slate-900">No events found</h3>
          <p className="mt-1 text-sm text-slate-500">
            No events match the selected category filter.
          </p>
        </div>
      ) : (
        /* Editorial Schedule Rows */
        <div className="divide-y divide-slate-200 border-t border-b border-slate-200">
          {filteredEvents.map((ev) => {
            const eventResults = results
              .filter(r => r.eventId === ev.id)
              .sort((a, b) => a.position - b.position)
              .slice(0, 3);

            return (
              <div key={ev.id} className="py-6 transition-colors hover:bg-slate-100/40 px-2 rounded-xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                        {ev.name}
                      </h2>
                      <span className="rounded-md bg-blue-100 px-2.5 py-0.5 text-xs font-black text-blue-900 uppercase">
                        {ev.category}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {getStatusBadge(ev.status)}
                  </div>
                </div>

                {/* Winner Placements for Completed Events */}
                {ev.status === 'completed' && eventResults.length > 0 && (
                  <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm font-semibold text-slate-700">
                    {eventResults.map((r) => {
                      const teamName = teams[r.teamId] || 'Team';
                      return (
                        <div key={r.id} className="flex items-center justify-between rounded-lg bg-slate-100/80 px-3 py-2 border border-slate-200">
                          <span className="truncate">
                            {r.position === 1 ? '🥇' : r.position === 2 ? '🥈' : '🥉'}{' '}
                            <span className="font-extrabold text-slate-900">
                              {r.participantName || teamName}
                            </span>
                            {r.participantName && (
                              <span className="text-xs text-slate-500 ml-1">({teamName})</span>
                            )}
                          </span>
                          <span className="font-mono text-xs font-black text-slate-900 shrink-0 ml-2">
                            +{r.points} pts
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
