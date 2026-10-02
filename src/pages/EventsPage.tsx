import React, { useState, useEffect } from 'react';
import type { SportsEvent } from '../types/models';
import { eventRepository } from '../data/repositories';
import { Calendar, RefreshCw, AlertCircle, CheckCircle2, PlayCircle, Clock } from 'lucide-react';

export const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<SportsEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const loadEventsData = async () => {
    try {
      setError(null);
      const eventsList = await eventRepository.getEvents();
      setEvents(eventsList);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load events list'));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadEventsData();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadEventsData();
  };

  // Group events by status
  const liveEvents = events.filter((e) => e.status === 'live');
  const upcomingEvents = events.filter((e) => e.status === 'upcoming' || !e.status);
  const completedEvents = events.filter((e) => e.status === 'completed');
  const archivedEvents = events.filter((e) => e.status === 'archived');

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'live':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-red-500/20 px-2 py-0.5 text-[10px] font-bold text-red-400 border border-red-500/30">
            <PlayCircle className="h-3 w-3 animate-pulse" /> LIVE NOW
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="h-3 w-3" /> COMPLETED
          </span>
        );
      case 'archived':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-500">
            ARCHIVED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-500/30">
            <Clock className="h-3 w-3" /> UPCOMING
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="h-6 w-6 text-amber-500" />
            <h1 className="font-sports text-2xl tracking-wide text-white">SPORTS MEET EVENTS</h1>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Official events list and current operational status.
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
            <div key={n} className="h-20 animate-pulse rounded-xl bg-slate-900 border border-slate-800" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-800/50 bg-red-950/20 p-6 text-center text-red-300">
          <AlertCircle className="mx-auto h-8 w-8 mb-2 text-red-400" />
          <h3 className="font-sports text-lg">Unable to load sports meet events</h3>
          <p className="text-xs text-red-400 mt-1">{error.message}</p>
        </div>
      ) : events.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-12 text-center">
          <Calendar className="mx-auto h-12 w-12 text-slate-600 mb-3" />
          <h3 className="font-sports text-xl text-white">NO EVENTS CREATED YET</h3>
          <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto">
            Events will be listed here as officials schedule and configure competition heats.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* Live Events Section */}
          {liveEvents.length > 0 && (
            <div className="space-y-3">
              <h2 className="font-sports text-lg text-red-400 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                LIVE IN PROGRESS ({liveEvents.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {liveEvents.map((ev) => (
                  <div key={ev.id} className="rounded-xl border border-red-500/40 bg-gradient-to-r from-red-950/30 to-slate-900 p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <h3 className="font-sports text-lg text-white">{ev.name}</h3>
                      {getStatusBadge(ev.status)}
                    </div>
                    {ev.category && (
                      <p className="text-xs text-slate-400 font-mono">Category: {ev.category}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Events Section */}
          {upcomingEvents.length > 0 && (
            <div className="space-y-3">
              <h2 className="font-sports text-lg text-amber-400 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                UPCOMING EVENTS ({upcomingEvents.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {upcomingEvents.map((ev) => (
                  <div key={ev.id} className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 space-y-2 hover:border-slate-700 transition-colors">
                    <div className="flex items-start justify-between">
                      <h3 className="font-sports text-lg text-white">{ev.name}</h3>
                      {getStatusBadge(ev.status)}
                    </div>
                    {ev.category && (
                      <p className="text-xs text-slate-400 font-mono">Category: {ev.category}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Completed Events Section */}
          {completedEvents.length > 0 && (
            <div className="space-y-3">
              <h2 className="font-sports text-lg text-emerald-400 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                COMPLETED EVENTS ({completedEvents.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {completedEvents.map((ev) => (
                  <div key={ev.id} className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <h3 className="font-sports text-lg text-slate-200">{ev.name}</h3>
                      {getStatusBadge(ev.status)}
                    </div>
                    {ev.category && (
                      <p className="text-xs text-slate-400 font-mono">Category: {ev.category}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Archived Events Section */}
          {archivedEvents.length > 0 && (
            <div className="space-y-3">
              <h2 className="font-sports text-lg text-slate-500 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-slate-600" />
                ARCHIVED EVENTS ({archivedEvents.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {archivedEvents.map((ev) => (
                  <div key={ev.id} className="rounded-xl border border-slate-800/60 bg-slate-950/40 p-4 space-y-2 opacity-60">
                    <div className="flex items-start justify-between">
                      <h3 className="font-sports text-base text-slate-400">{ev.name}</h3>
                      {getStatusBadge(ev.status)}
                    </div>
                    {ev.category && (
                      <p className="text-xs text-slate-500 font-mono">Category: {ev.category}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};
