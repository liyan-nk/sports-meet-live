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
      setError(err instanceof Error ? err : new Error('Failed to load events list'));
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
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-700 border border-red-200">
            <PlayCircle className="h-3 w-3 animate-pulse text-red-600" /> LIVE
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="h-3 w-3 text-emerald-600" /> COMPLETED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200">
            <Clock className="h-3 w-3 text-amber-600" /> UPCOMING
          </span>
        );
    }
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Events</h1>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            Track, field, indoor and team championships schedule.
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

      {/* Loading & State Handler */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-28 animate-pulse rounded-2xl bg-white border border-slate-200" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-900">
          <AlertCircle className="mx-auto h-7 w-7 mb-2 text-red-600" />
          <h3 className="text-base font-bold">Couldn't load events</h3>
          <p className="text-xs text-red-700 mt-1">{error.message}</p>
          <button
            onClick={handleRefresh}
            className="mt-3 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
          <Calendar className="mx-auto h-10 w-10 text-slate-400 mb-2" />
          <h3 className="text-base font-bold text-slate-900">No events found</h3>
          <p className="mt-1 text-xs text-slate-500">
            No events match the selected category filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredEvents.map((ev) => {
            const eventResults = results
              .filter(r => r.eventId === ev.id)
              .sort((a, b) => a.position - b.position)
              .slice(0, 3);

            return (
              <div
                key={ev.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 uppercase tracking-wider border border-blue-200">
                      {ev.category}
                    </span>
                    {getStatusBadge(ev.status)}
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                    {ev.name}
                  </h3>

                  {/* Podium Highlights if Completed */}
                  {ev.status === 'completed' && eventResults.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
                      {eventResults.map((r) => {
                        const teamName = teams[r.teamId] || 'Team';
                        return (
                          <div key={r.id} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1.5 truncate">
                              <span className="shrink-0 text-xs">
                                {r.position === 1 ? '🥇' : r.position === 2 ? '🥈' : '🥉'}
                              </span>
                              <span className="font-semibold text-slate-900 truncate">
                                {r.participantName || teamName}
                              </span>
                              {r.participantName && (
                                <span className="text-[11px] text-slate-500 truncate">
                                  ({teamName})
                                </span>
                              )}
                            </div>
                            <span className="font-mono text-xs font-bold text-slate-700 shrink-0 ml-2">
                              +{r.points} pts
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
