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
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
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
    <div className="space-y-6">
      
      {/* Admin Top Banner */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Admin Portal</h1>
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" /> Authorized
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Logged in as: <strong className="text-slate-800">{user.email}</strong>
            {!isAppwriteConfigured && <span className="ml-2 text-amber-600 font-mono text-[10px]">(Mock Mode)</span>}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/admins"
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <UserCheck className="h-3.5 w-3.5 text-blue-600" />
            <span>Admins</span>
          </Link>

          <button
            onClick={() => loadDashboardData()}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            title="Refresh dashboard data"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoadingData ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>

          <button
            onClick={() => logout()}
            className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Quick Action Buttons Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Quick Actions</h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            onClick={() => setIsAddResultOpen(true)}
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-xs font-extrabold text-white hover:bg-blue-700 shadow-xs active:scale-98 transition-all"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span>+ Add Result</span>
          </button>

          <button
            onClick={() => setIsCreateEventOpen(true)}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs font-bold text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <Calendar className="h-4 w-4 text-blue-600" />
            <span>+ Create Event</span>
          </button>

          <button
            onClick={() => setIsAdjustmentModalOpen(true)}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs font-bold text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <SlidersHorizontal className="h-4 w-4 text-slate-600" />
            <span>Starting Points</span>
          </button>

          <Link
            to="/admin/posters"
            className="flex items-center justify-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-xs font-bold text-amber-900 hover:bg-amber-100 transition-colors"
          >
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span>Posters</span>
          </Link>
        </div>
      </div>

      {/* Main Grid: Standings & Results Operations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Standings Column */}
        <div className="lg:col-span-1 space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Current Leaderboard</h3>
              <span className="text-[11px] font-semibold text-slate-500 font-mono">{standings.length} Teams</span>
            </div>

            <div className="space-y-2">
              {standings.map((item) => (
                <div
                  key={item.team.id}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 p-2.5"
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`flex h-6 w-6 items-center justify-center rounded-lg text-xs font-bold ${
                      item.position === 1 ? 'bg-amber-400 text-amber-950' :
                      item.position === 2 ? 'bg-slate-300 text-slate-800' :
                      item.position === 3 ? 'bg-orange-300 text-orange-950' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      #{item.position}
                    </span>
                    <span className="text-xs font-extrabold text-slate-900">{item.team.name}</span>
                  </div>
                  <span className="font-mono text-sm font-black text-slate-900 tabular-nums">
                    {item.totalPoints} <span className="text-[10px] text-slate-500 font-bold">PTS</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Managed Events Section */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Managed Events</h3>
              <span className="text-[11px] font-semibold text-slate-500 font-mono">{events.length} Events</span>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {events.map((ev) => (
                <div key={ev.id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 p-2.5 text-xs">
                  <div>
                    <span className="font-bold text-slate-900 block">{ev.name}</span>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">{ev.status || 'upcoming'}</span>
                  </div>
                  <button
                    onClick={() => setEditingEvent(ev)}
                    className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200 hover:text-blue-600 transition-colors"
                    title="Edit Event"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Results Audit Column */}
        <div className="lg:col-span-2 space-y-5">
          
          {/* Recent Results History */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Recent Results History</h3>
              <span className="text-[11px] font-semibold text-slate-500 font-mono">{recentResults.length} Entries</span>
            </div>

            {recentResults.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                No results recorded yet. Click "+ Add Result" above to add placement scores.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-100 text-xs">
                {recentResults.map((res) => (
                  <div key={res.id} className="p-3 hover:bg-slate-50/60 transition-colors space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 text-sm">{getEventName(res.eventId)}</span>
                        <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                          res.position === 1 ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                          res.position === 2 ? 'bg-slate-200 text-slate-800' :
                          res.position === 3 ? 'bg-orange-100 text-orange-900' : 'bg-slate-100 text-slate-600'
                        }`}>
                          #{res.position} Place
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-black text-slate-900 tabular-nums">
                          +{res.points} PTS
                        </span>

                        <Link
                          to={
                            res.participantName
                              ? `/admin/posters?name=${encodeURIComponent(res.participantName)}&team=${encodeURIComponent(getTeamName(res.teamId))}&eventName=${encodeURIComponent(getEventName(res.eventId))}&position=${res.position}&type=individual`
                              : `/admin/posters?name=${encodeURIComponent(getTeamName(res.teamId))}&eventName=${encodeURIComponent(getEventName(res.eventId))}&position=${res.position}&type=team`
                          }
                          className="rounded-lg border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] font-bold text-amber-900 hover:bg-amber-100 transition-colors flex items-center gap-1"
                          title="Generate poster"
                        >
                          <Sparkles className="h-3 w-3" />
                          <span>Poster</span>
                        </Link>

                        <button
                          onClick={() => setEditingResult(res)}
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-blue-600 transition-colors"
                          title="Edit Result"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>

                        <button
                          onClick={() => setDeletingResult(res)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                          title="Delete Result"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Audit Info Row */}
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 font-medium">
                      {res.participantName && (
                        <span>Participant: <strong className="text-slate-900">{res.participantName}</strong></span>
                      )}
                      <span>Team: <strong className="text-slate-900">{getTeamName(res.teamId)}</strong></span>
                      {res.createdBy && (
                        <span className="flex items-center gap-1 text-slate-400">
                          <User className="h-3 w-3" /> by {res.createdBy}
                        </span>
                      )}
                      {res.createdAt && (
                        <span className="flex items-center gap-1 text-slate-400">
                          <Clock className="h-3 w-3" /> {new Date(res.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Starting Points Section */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <SlidersHorizontal className="h-4 w-4 text-blue-600" />
                  <span>Starting Points Adjustments</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Pre-system points adjustments separated from official event results.
                </p>
              </div>

              <button
                onClick={() => setIsAdjustmentModalOpen(true)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                + Adjust
              </button>
            </div>

            {adjustments.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500">
                No standings adjustments currently recorded.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 rounded-xl border border-slate-100 bg-white text-xs">
                {adjustments.map((adj) => (
                  <div key={adj.id} className="p-3 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{getTeamName(adj.teamId)}</span>
                        <span className={`font-mono text-xs font-extrabold ${adj.points >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                          {adj.points >= 0 ? `+${adj.points}` : adj.points} PTS
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{adj.reason || 'Starting Points Adjustment'}</p>
                    </div>

                    <button
                      onClick={() => setDeletingAdjustment(adj)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                      title="Delete adjustment"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
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

      {/* Modals */}
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
