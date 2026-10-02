import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Navigate, Link } from 'react-router-dom';
import type { TeamStanding, Result, SportsEvent, StandingsAdjustment, Team, ScoringRule } from '../types/models';
import { standingsRepository, resultRepository, eventRepository, adjustmentRepository, scoringRepository } from '../data/repositories';
import { AddResultModal } from '../components/admin/AddResultModal';
import { EditResultModal } from '../components/admin/EditResultModal';
import { CreateEventModal } from '../components/admin/CreateEventModal';
import { EditEventModal } from '../components/admin/EditEventModal';
import { DeleteConfirmModal } from '../components/admin/DeleteConfirmModal';
import { StandingsAdjustmentModal } from '../components/admin/StandingsAdjustmentModal';
import { ScoringRulesEditor } from '../components/admin/ScoringRulesEditor';
import {
  Plus,
  ShieldCheck,
  LogOut,
  Trash2,
  Edit2,
  Calendar,
  RefreshCw,
  Sparkles,
  SlidersHorizontal,
  UserCheck,
  User,
  Clock
} from 'lucide-react';
import { isAppwriteConfigured } from '../lib/appwrite';

export const AdminDashboardPage: React.FC = () => {
  const { user, isAuthorizedAdmin, isLoading: isAuthLoading, logout } = useAuth();
  
  const [standings, setStandings] = useState<TeamStanding[]>([]);
  const [recentResults, setRecentResults] = useState<Result[]>([]);
  const [events, setEvents] = useState<SportsEvent[]>([]);
  const [adjustments, setAdjustments] = useState<StandingsAdjustment[]>([]);
  const [scoringRules, setScoringRules] = useState<ScoringRule[]>([]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);

  // Modal States
  const [isAddResultOpen, setIsAddResultOpen] = useState<boolean>(false);
  const [isCreateEventOpen, setIsCreateEventOpen] = useState<boolean>(false);
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState<boolean>(false);
  
  // Edit & Delete targets
  const [editingResult, setEditingResult] = useState<Result | null>(null);
  const [editingEvent, setEditingEvent] = useState<SportsEvent | null>(null);
  
  const [deletingResult, setDeletingResult] = useState<Result | null>(null);
  const [deletingAdjustment, setDeletingAdjustment] = useState<StandingsAdjustment | null>(null);

  const loadDashboardData = useCallback(async () => {
    try {
      setIsLoadingData(true);
      const [standingsList, resultsList, eventList, adjustmentList, rulesList] = await Promise.all([
        standingsRepository.getStandings(),
        resultRepository.getResults(),
        eventRepository.getEvents(),
        adjustmentRepository?.getAdjustments ? adjustmentRepository.getAdjustments() : Promise.resolve([]),
        scoringRepository.getScoringRules(),
      ]);
      setStandings(standingsList);
      setRecentResults(resultsList);
      setEvents(eventList);
      setAdjustments(adjustmentList);
      setScoringRules(rulesList);
    } catch (err) {
      console.error('Failed to load admin dashboard data:', err);
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (user && isAuthorizedAdmin) {
      loadDashboardData();
    }
  }, [user, isAuthorizedAdmin, loadDashboardData]);

  if (isAuthLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
      </div>
    );
  }

  // Security Guard: Redirect unauthorized users to /admin/login
  if (!user || !isAuthorizedAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  const teams: Team[] = standings.map((s) => s.team);

  const getEventName = (eventId: string) => {
    const ev = events.find((e) => e.id === eventId);
    return ev ? ev.name : 'Unknown Event';
  };

  const getTeamName = (teamId: string) => {
    const t = teams.find((tm) => tm.id === teamId);
    return t ? t.name : teamId.replace('team-', '').toUpperCase();
  };

  const handleConfirmDeleteResult = async () => {
    if (!deletingResult) return;
    if (!resultRepository.deleteResult) {
      alert('Delete operation only supported in database repository.');
      setDeletingResult(null);
      return;
    }
    try {
      await resultRepository.deleteResult(deletingResult.id);
      await loadDashboardData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete result');
    } finally {
      setDeletingResult(null);
    }
  };

  const handleConfirmDeleteAdjustment = async () => {
    if (!deletingAdjustment) return;
    if (!adjustmentRepository.deleteAdjustment) {
      alert('Delete operation not supported.');
      setDeletingAdjustment(null);
      return;
    }
    try {
      await adjustmentRepository.deleteAdjustment(deletingAdjustment.id);
      await loadDashboardData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete adjustment');
    } finally {
      setDeletingAdjustment(null);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Admin Top Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-800 bg-slate-900/90 p-5 sm:p-6 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-sports text-lg tracking-wider text-white">SPORTS MEET 2026</span>
            <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" /> AUTHORISED ADMIN
            </span>
            <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-500/30">
              DEMO DATASET
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Logged in as: <strong className="text-slate-200">{user.email}</strong>
            {!isAppwriteConfigured && <span className="ml-2 text-amber-400 font-mono text-[10px]">(Local Dev Mode)</span>}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/admins"
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-emerald-400 hover:bg-slate-700 transition-colors"
          >
            <UserCheck className="h-3.5 w-3.5" />
            <span>Manage Admins</span>
          </Link>

          <button
            onClick={() => loadDashboardData()}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-slate-300 hover:text-white transition-colors"
            title="Refresh dashboard data"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoadingData ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => logout()}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/90 px-3.5 py-2 text-xs font-semibold text-red-400 hover:bg-red-950/40 hover:text-red-300 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Hero Operations Control Hub */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 p-5">
        <div>
          <h2 className="font-sports text-xl text-white">EVENT OPERATIONS</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Record completed event placements, adjust starting points, and trigger live standings updates.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5 w-full sm:w-auto">
          <button
            onClick={() => setIsAdjustmentModalOpen(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition-colors"
            title="Manage pre-system starting points adjustments"
          >
            <SlidersHorizontal className="h-4 w-4 text-slate-400" />
            <span>Starting Points</span>
          </button>

          <Link
            to="/admin/posters"
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2.5 text-xs font-semibold text-amber-400 hover:bg-amber-500/20 transition-colors"
          >
            <Sparkles className="h-4 w-4" />
            <span>Poster Generator</span>
          </Link>

          <button
            onClick={() => setIsCreateEventOpen(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
          >
            <Calendar className="h-4 w-4 text-amber-400" />
            <span>+ Create Event</span>
          </button>

          <button
            onClick={() => setIsAddResultOpen(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-5 py-2.5 text-xs font-black text-slate-950 hover:bg-amber-400 shadow-lg active:scale-98 transition-transform"
          >
            <Plus className="h-4.5 w-4.5 stroke-[3]" />
            <span>+ ADD RESULT</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Standings & Events / Results Operations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Standings Column */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="font-sports text-lg text-white">CURRENT STANDINGS</h3>
            <span className="text-[11px] text-slate-400 font-mono">{standings.length} Teams</span>
          </div>

          <div className="space-y-2.5">
            {standings.map((item) => (
              <div
                key={item.team.id}
                className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/80 p-3"
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-7 w-7 items-center justify-center rounded font-sports text-xs font-bold ${
                    item.position === 1 ? 'bg-amber-500 text-slate-950' :
                    item.position === 2 ? 'bg-slate-300 text-slate-950' :
                    item.position === 3 ? 'bg-amber-700 text-white' :
                    'bg-slate-800 text-slate-400'
                  }`}>
                    #{item.position}
                  </div>
                  <div>
                    <span className="font-sports text-base text-white">{item.team.name}</span>
                    <span className="ml-1.5 font-mono text-[10px] text-slate-500">{item.team.code}</span>
                  </div>
                </div>
                <div className="font-sports text-xl text-amber-400 tabular-nums">
                  {item.totalPoints} <span className="text-xs text-slate-400 font-normal">PTS</span>
                </div>
              </div>
            ))}
          </div>

          {/* Managed Events Section */}
          <div className="pt-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-sports text-lg text-white">MANAGED EVENTS</h3>
              <span className="text-[11px] text-slate-400 font-mono">{events.length} Events</span>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {events.map((ev) => (
                <div key={ev.id} className="flex items-center justify-between rounded-lg border border-slate-800/80 bg-slate-950 p-2.5 text-xs">
                  <div>
                    <span className="font-sports text-sm text-slate-200 block">{ev.name}</span>
                    <span className="text-[10px] text-slate-500 uppercase">{ev.status || 'upcoming'}</span>
                  </div>
                  <button
                    onClick={() => setEditingEvent(ev)}
                    className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-amber-400 transition-colors"
                    title="Edit Event Details"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Results Audit Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Results List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-sports text-lg text-white">RECENT RESULTS HISTORY</h3>
              <span className="text-[11px] text-slate-400 font-mono">{recentResults.length} Entries</span>
            </div>

            {recentResults.length === 0 ? (
              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-8 text-center text-xs text-slate-400">
                No individual results recorded yet. Click "+ ADD RESULT" above to enter event placement scores.
              </div>
            ) : (
              <div className="divide-y divide-slate-800/80 overflow-hidden rounded-xl border border-slate-800 bg-slate-900/40 text-sm">
                {recentResults.map((res) => (
                  <div key={res.id} className="p-3.5 hover:bg-slate-800/30 transition-colors space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-sports text-base text-white">{getEventName(res.eventId)}</span>
                        <span className={`rounded px-1.5 py-0.2 text-[10px] font-bold ${
                          res.position === 1 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                          res.position === 2 ? 'bg-slate-400/20 text-slate-300' :
                          res.position === 3 ? 'bg-amber-700/20 text-amber-600' : 'bg-slate-800 text-slate-400'
                        }`}>
                          #{res.position} Place
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="font-sports text-lg text-amber-400 tabular-nums">
                          +{res.points} PTS
                        </div>

                        <Link
                          to={
                            res.participantName
                              ? `/admin/posters?name=${encodeURIComponent(res.participantName)}&team=${encodeURIComponent(getTeamName(res.teamId))}&eventName=${encodeURIComponent(getEventName(res.eventId))}&position=${res.position}&type=individual`
                              : `/admin/posters?name=${encodeURIComponent(getTeamName(res.teamId))}&eventName=${encodeURIComponent(getEventName(res.eventId))}&position=${res.position}&type=team`
                          }
                          className="rounded border border-slate-700 bg-slate-800 px-2 py-1 text-[11px] font-semibold text-amber-400 hover:bg-slate-700 transition-colors flex items-center gap-1"
                          title="Generate poster for this result"
                        >
                          <Sparkles className="h-3 w-3" />
                          <span>Poster</span>
                        </Link>

                        <button
                          onClick={() => setEditingResult(res)}
                          className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-amber-400 transition-colors"
                          title="Edit Result"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => setDeletingResult(res)}
                          className="rounded p-1 text-slate-500 hover:bg-red-950/40 hover:text-red-400 transition-colors"
                          title="Delete Result"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Audit Info Row */}
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 font-mono border-t border-slate-800/40 pt-1.5">
                      {res.participantName && (
                        <span>Participant: <strong className="text-amber-300">{res.participantName}</strong></span>
                      )}
                      <span>Team: <strong className="text-slate-200">{getTeamName(res.teamId)}</strong></span>
                      {res.createdBy && (
                        <span className="flex items-center gap-1 text-slate-400">
                          <User className="h-3 w-3 text-slate-500" /> by {res.createdBy}
                        </span>
                      )}
                      {res.createdAt && (
                        <span className="flex items-center gap-1 text-slate-500">
                          <Clock className="h-3 w-3" /> {new Date(res.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Standings Adjustments / Starting Points Section */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-sports text-lg text-white flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-amber-400" />
                  STARTING POINTS / STANDINGS ADJUSTMENTS
                </h3>
                <p className="text-[11px] text-slate-400">
                  Pre-system carryover points clearly separated from official event results.
                </p>
              </div>

              <button
                onClick={() => setIsAdjustmentModalOpen(true)}
                className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-amber-400 hover:bg-slate-700 transition-colors"
              >
                + New Adjustment
              </button>
            </div>

            {adjustments.length === 0 ? (
              <div className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-4 text-center text-xs text-slate-500">
                No standings adjustments currently recorded.
              </div>
            ) : (
              <div className="divide-y divide-slate-800/60 rounded-xl border border-slate-800 bg-slate-950 text-xs">
                {adjustments.map((adj) => (
                  <div key={adj.id} className="p-3 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-sports text-sm text-slate-200">{getTeamName(adj.teamId)}</span>
                        <span className={`font-mono text-xs font-bold ${adj.points >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {adj.points >= 0 ? `+${adj.points}` : adj.points} PTS
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{adj.reason || 'Starting Points Adjustment'}</p>
                    </div>

                    <button
                      onClick={() => setDeletingAdjustment(adj)}
                      className="rounded p-1 text-slate-500 hover:bg-red-950/40 hover:text-red-400 transition-colors"
                      title="Delete adjustment entry"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Scoring Rules Manager */}
      <ScoringRulesEditor onRulesUpdated={loadDashboardData} />

      {/* --- ALL OPERATIONAL MODALS --- */}
      
      <AddResultModal
        isOpen={isAddResultOpen}
        onClose={() => setIsAddResultOpen(false)}
        onSuccess={loadDashboardData}
        onOpenCreateEvent={() => {
          setIsAddResultOpen(false);
          setIsCreateEventOpen(true);
        }}
      />

      <CreateEventModal
        isOpen={isCreateEventOpen}
        onClose={() => setIsCreateEventOpen(false)}
        onSuccess={() => {
          loadDashboardData();
          setIsAddResultOpen(true);
        }}
      />

      <EditResultModal
        isOpen={!!editingResult}
        onClose={() => setEditingResult(null)}
        onSuccess={loadDashboardData}
        result={editingResult}
        events={events}
        teams={teams}
        scoringRules={scoringRules}
      />

      <EditEventModal
        isOpen={!!editingEvent}
        onClose={() => setEditingEvent(null)}
        onSuccess={loadDashboardData}
        event={editingEvent}
      />

      <StandingsAdjustmentModal
        isOpen={isAdjustmentModalOpen}
        onClose={() => setIsAdjustmentModalOpen(false)}
        onSuccess={loadDashboardData}
        teams={teams}
      />

      <DeleteConfirmModal
        isOpen={!!deletingResult}
        onClose={() => setDeletingResult(null)}
        onConfirm={handleConfirmDeleteResult}
        title="DELETE EVENT RESULT?"
        description="Deleting this result will recalculate total team standings immediately across all public clients."
        itemDetails={
          deletingResult
            ? [
                { label: 'Event', value: getEventName(deletingResult.eventId) },
                { label: 'Team', value: getTeamName(deletingResult.teamId) },
                { label: 'Position', value: `#${deletingResult.position} Place` },
                { label: 'Points', value: `+${deletingResult.points} PTS` },
              ]
            : []
        }
      />

      <DeleteConfirmModal
        isOpen={!!deletingAdjustment}
        onClose={() => setDeletingAdjustment(null)}
        onConfirm={handleConfirmDeleteAdjustment}
        title="DELETE STANDINGS ADJUSTMENT?"
        description="Deleting this starting points adjustment will recalculate overall team totals."
        itemDetails={
          deletingAdjustment
            ? [
                { label: 'Team', value: getTeamName(deletingAdjustment.teamId) },
                { label: 'Points', value: `${deletingAdjustment.points >= 0 ? '+' : ''}${deletingAdjustment.points} PTS` },
                { label: 'Reason', value: deletingAdjustment.reason || 'Starting Points Adjustment' },
              ]
            : []
        }
      />

    </div>
  );
};
