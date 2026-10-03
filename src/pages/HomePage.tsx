import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStandings } from '../hooks/useStandings';
import type { SportsEvent, Result } from '../types/models';
import { eventRepository, resultRepository } from '../data/repositories';
import { Trophy, Award, ArrowRight, Zap, RefreshCw } from 'lucide-react';

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

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      
      {/* 1. TODAY / LIVE SECTION */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-slate-300">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Today's Highlight</span>
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-blue-600 transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>
        </div>

        {currentEvent ? (
          <div className="mt-3 flex items-center justify-between gap-3">
            <div>
              <span className="inline-block rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-700 border border-blue-200">
                {currentEvent.category}
              </span>
              <h2 className="mt-1 text-lg font-extrabold text-slate-900 tracking-tight">{currentEvent.name}</h2>
              <p className="text-xs text-slate-500">
                {currentEvent.status === 'completed' ? 'Event completed' : currentEvent.status === 'live' || currentEvent.status === 'ongoing' ? 'Live on Main Ground' : 'Scheduled Soon'}
              </p>
            </div>
            <Link
              to="/events"
              className="flex items-center gap-1 shrink-0 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
            >
              <span>Details</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : (
          <div className="mt-3 text-sm text-slate-500">No active events right now.</div>
        )}
      </section>

      {/* 2. STANDINGS PREVIEW */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-500" />
              <span>Team Standings</span>
            </h2>
            <p className="text-xs text-slate-500">Live points leaderboard</p>
          </div>
          <Link
            to="/standings"
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <span>Full Standings</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {isLoading && standings.length === 0 ? (
          <div className="space-y-2">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="h-12 w-full animate-pulse rounded-xl bg-slate-100" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {standings.slice(0, 4).map((item) => {
              const rank = item.position;
              const isFirst = rank === 1;
              const isSecond = rank === 2;
              const isThird = rank === 3;

              return (
                <div
                  key={item.team.id}
                  className={`flex items-center justify-between rounded-xl p-3 border transition-colors ${
                    isFirst ? 'bg-amber-50/50 border-amber-200' :
                    isSecond ? 'bg-slate-50/80 border-slate-200' :
                    isThird ? 'bg-orange-50/40 border-orange-200' :
                    'bg-white border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-extrabold ${
                      isFirst ? 'bg-amber-400 text-amber-950' :
                      isSecond ? 'bg-slate-300 text-slate-800' :
                      isThird ? 'bg-orange-300 text-orange-950' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {rank}
                    </span>
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900 leading-tight">{item.team.name}</h3>
                      <p className="text-[11px] text-slate-500">{item.resultsCount} results completed</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-lg font-black text-slate-900 font-mono tabular-nums">{item.totalPoints}</span>
                    <span className="text-[11px] font-semibold text-slate-500 ml-1">PTS</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 3. RECENT RESULTS PREVIEW */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Award className="h-4 w-4 text-blue-600" />
              <span>Recent Results</span>
            </h2>
            <p className="text-xs text-slate-500">Latest completed events</p>
          </div>
          <Link
            to="/results"
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <span>All Results</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {recentResults.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500">No results published yet.</div>
        ) : (
          <div className="space-y-2.5">
            {recentResults.map((resItem) => {
              const eventObj = events.find((e) => e.id === resItem.eventId);
              const teamObj = standings.find((s) => s.team.id === resItem.teamId)?.team;
              
              return (
                <div
                  key={resItem.id}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-3 hover:bg-slate-100/60 transition-colors"
                >
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200/60">
                      {eventObj?.name || 'Event'}
                    </span>
                    <div className="text-sm font-bold text-slate-900">
                      {resItem.participantName ? resItem.participantName : (teamObj?.name || 'Team Event')}
                    </div>
                    {teamObj && (
                      <div className="text-xs font-medium text-slate-500">
                        {teamObj.name}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-bold ${
                      resItem.position === 1 ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                      resItem.position === 2 ? 'bg-slate-200 text-slate-800 border border-slate-300' :
                      'bg-orange-100 text-orange-900 border border-orange-300'
                    }`}>
                      {resItem.position === 1 ? '🥇 1st' : resItem.position === 2 ? '🥈 2nd' : '🥉 3rd'}
                    </span>
                    <span className="text-xs font-black text-slate-700 font-mono tabular-nums">
                      +{resItem.points} pts
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Quick Navigation Footer Link */}
      <div className="text-center pt-2">
        <Link
          to="/events"
          className="inline-flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-2.5 text-xs font-bold text-blue-700 hover:bg-blue-100 transition-colors border border-blue-200"
        >
          <Zap className="h-4 w-4" />
          <span>Explore All Events & Schedule</span>
        </Link>
      </div>

    </div>
  );
};
