import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStandings } from '../hooks/useStandings';
import type { SportsEvent, Result } from '../types/models';
import { eventRepository, resultRepository } from '../data/repositories';
import { Trophy, Award, ArrowRight, RefreshCw, PlayCircle, Clock } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { standings, isLoading, refresh } = useStandings();
  const [events, setEvents] = useState<SportsEvent[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadExtraData = async () => {
    try {
      const [evList, resList] = await Promise.all([
        eventRepository.getEvents(),
        resultRepository.getResults(),
      ]);
      setEvents(evList);
      setResults(resList);
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    loadExtraData();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refresh(), loadExtraData()]);
    setTimeout(() => setIsRefreshing(false), 300);
  };

  const currentEvent = events.find(e => e.status === 'ongoing' || e.status === 'live') ||
                       events.find(e => e.status === 'upcoming') ||
                       events[0];
  const recentResults = results.slice(0, 4);
  const leaderPoints = standings[0]?.totalPoints || 0;

  return (
    <div className="space-y-12 sm:space-y-14">
      
      {/* 1. LIVE / FEATURED EVENT HERO */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            {currentEvent?.status === 'live' || currentEvent?.status === 'ongoing' ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-900 border border-emerald-300">
                <PlayCircle className="h-4 w-4 text-emerald-600 animate-pulse shrink-0" /> LIVE NOW
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-950 border border-amber-300">
                <Clock className="h-4 w-4 text-amber-700 shrink-0" /> FEATURED EVENT
              </span>
            )}
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>
        </div>

        {currentEvent ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-blue-100 px-3 py-1 text-xs font-black text-blue-900 uppercase tracking-wide">
                {currentEvent.category}
              </span>
              <span className="text-sm font-semibold text-slate-500">
                {currentEvent.status === 'completed' ? 'Completed' : currentEvent.status === 'live' || currentEvent.status === 'ongoing' ? 'Main Track Ground' : 'Scheduled Today'}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                {currentEvent.name}
              </h1>

              <Link
                to="/events"
                className="inline-flex h-12 sm:h-14 items-center justify-center gap-2 self-start sm:self-auto rounded-xl bg-slate-900 px-6 text-sm sm:text-base font-extrabold text-white hover:bg-slate-800 transition-colors shadow-xs whitespace-nowrap"
              >
                <span>View Event Details</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ) : (
          <p className="text-base text-slate-500 py-2">No active events currently scheduled.</p>
        )}
      </section>

      {/* 2. LEADERBOARD SCOREBOARD PREVIEW */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2 tracking-tight">
              <Trophy className="h-6 w-6 text-amber-500 shrink-0" />
              <span>Team Leaderboard</span>
            </h2>
            <p className="text-sm font-semibold text-slate-500">Live official points standings</p>
          </div>
          <Link
            to="/standings"
            className="text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 shrink-0"
          >
            <span>Full Board</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {isLoading && standings.length === 0 ? (
          <div className="space-y-3 py-2">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="h-16 w-full animate-pulse rounded-xl bg-slate-200/60" />
            ))}
          </div>
        ) : (
          <div className="divide-y divide-slate-200 border-t border-b border-slate-200">
            {standings.slice(0, 4).map((item) => {
              const rank = item.position;
              const isFirst = rank === 1;
              const diffPoints = (!isFirst && leaderPoints) ? (leaderPoints - item.totalPoints) : 0;

              return (
                <div
                  key={item.team.id}
                  className={`flex items-center justify-between py-4 sm:py-5 px-2 transition-colors ${
                    isFirst ? 'bg-amber-50/50' : 'hover:bg-slate-100/40'
                  }`}
                >
                  {/* Left: Rank & Team */}
                  <div className="flex items-center gap-3.5 sm:gap-6 min-w-0">
                    <span className={`flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl font-mono text-base sm:text-xl font-black tabular-nums ${
                      isFirst ? 'bg-amber-400 text-amber-950 shadow-xs' : 'bg-slate-200 text-slate-800'
                    }`}>
                      0{rank}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-tight truncate">
                          {item.team.name}
                        </h3>
                        {isFirst && (
                          <span className="hidden sm:inline-block rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-black text-amber-900 border border-amber-300">
                            Leader
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-500">
                        <span>{item.resultsCount} events</span>
                        {!isFirst && diffPoints > 0 && (
                          <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 font-mono font-bold text-slate-600">
                            -{diffPoints} PTS
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Points */}
                  <div className="text-right shrink-0 pl-3">
                    <span className="text-2xl sm:text-4xl font-black text-slate-900 font-mono tabular-nums">
                      {item.totalPoints}
                    </span>
                    <span className="text-[11px] sm:text-xs font-extrabold text-slate-500 block uppercase tracking-wider">
                      PTS
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 3. RECENT RESULTS FEED */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2 tracking-tight">
              <Award className="h-6 w-6 text-blue-600 shrink-0" />
              <span>Latest Results</span>
            </h2>
            <p className="text-sm font-semibold text-slate-500">Official verified placements</p>
          </div>
          <Link
            to="/results"
            className="text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 shrink-0"
          >
            <span>All Results</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {recentResults.length === 0 ? (
          <p className="py-4 text-base text-slate-500">No results published yet.</p>
        ) : (
          <div className="divide-y divide-slate-200 border-t border-b border-slate-200">
            {recentResults.map((resItem) => {
              const eventObj = events.find((e) => e.id === resItem.eventId);
              const teamObj = standings.find((s) => s.team.id === resItem.teamId)?.team;
              
              return (
                <div
                  key={resItem.id}
                  className="flex items-center justify-between py-4 px-2 transition-colors hover:bg-slate-100/40"
                >
                  <div className="space-y-1 min-w-0 pr-4">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-blue-900 bg-blue-100 px-2 py-0.5 rounded-md">
                      {eventObj?.name || 'Event'}
                    </span>
                    <div className="text-base sm:text-lg font-extrabold text-slate-900 truncate">
                      {resItem.participantName ? resItem.participantName : (teamObj?.name || 'Team Event')}
                    </div>
                    {teamObj && (
                      <div className="text-sm font-semibold text-slate-500">
                        {teamObj.name}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`inline-flex items-center rounded-xl px-3 py-1 text-sm font-black ${
                      resItem.position === 1 ? 'bg-amber-400 text-amber-950' :
                      resItem.position === 2 ? 'bg-slate-200 text-slate-800' :
                      'bg-amber-100 text-amber-900'
                    }`}>
                      {resItem.position === 1 ? '🥇 1st' : resItem.position === 2 ? '🥈 2nd' : '🥉 3rd'}
                    </span>
                    <span className="text-lg font-black text-slate-900 font-mono tabular-nums">
                      +{resItem.points}
                    </span>
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
