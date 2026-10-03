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
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

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
    <div className="space-y-10">
      
      {/* Admin Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-200">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">ADMIN PORTAL</h1>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-900 border border-emerald-300 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-700" /> Authorized
            </span>
          </div>
          <p className="text-sm font-semibold text-slate-500">
            Official admin control panel · Signed in as: <strong className="text-slate-900">{user.email}</strong>
            {!isAppwriteConfigured && <span className="ml-2 text-amber-700 font-mono text-xs">(Mock Mode)</span>}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/admin/admins"
            className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <UserCheck className="h-4 w-4 text-blue-600" />
            <span>Admins</span>
          </Link>

          <button
            onClick={() => loadDashboardData()}
            className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${isLoadingData ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>

          <button
            onClick={() => logout()}
            className="flex items-center gap-2 rounded-xl border border-red-300 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-800 hover:bg-red-100 transition-colors"
          >
            <LogOut className="h-4 w-4 text-red-600" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Large Obvious Quick Actions */}
      <section className="space-y-3">
        <h2 className="text-sm font-black uppercase tracking-wider text-slate-500">Quick Actions</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={() => setIsAddResultOpen(true)}
            className="flex h-14 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-base font-extrabold text-white hover:bg-blue-700 transition-all shadow-xs"
          >
            <Plus className="h-5 w-5 stroke-[3]" />
            <span>+ ADD RESULT</span>
          </button>

          <button
            onClick={() => setIsCreateEventOpen(true)}
            className="flex h-14 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 text-base font-bold text-slate-900 hover:bg-slate-100 transition-colors shadow-xs"
          >
            <Calendar className="h-5 w-5 text-blue-600" />
            <span>+ CREATE EVENT</span>
          </button>

          <button
            onClick={() => setIsAdjustmentModalOpen(true)}
            className="flex h-14 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 text-base font-bold text-slate-900 hover:bg-slate-100 transition-colors shadow-xs"
          >
            <SlidersHorizontal className="h-5 w-5 text-slate-700" />
            <span>STARTING POINTS</span>
          </button>

          <Link
            to="/admin/posters"
            className="flex h-14 items-center justify-center gap-2 rounded-xl border border-amber-300 bg-amber-100/80 px-5 text-base font-extrabold text-amber-950 hover:bg-amber-200 transition-colors shadow-xs"
          >
            <Sparkles className="h-5 w-5 text-amber-700" />
            <span>POSTERS</span>
          </Link>
        </div>
      </section>

      {/* Today's Events Schedule */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">TODAY'S EVENTS</h2>
          <span className="text-sm font-bold text-slate-500">{events.length} Events Total</span>
        </div>

        <div className="divide-y divide-slate-200 border-t border-b border-slate-200">
          {events.map((ev) => (
            <div key={ev.id} className="flex items-center justify-between py-4 px-2 hover:bg-slate-100/40 transition-colors">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">{ev.name}</h3>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                  {ev.category || 'Track'} · Status: {ev.status || 'upcoming'}
                </span>
              </div>
              <button
                onClick={() => setEditingEvent(ev)}
                className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-800 hover:bg-slate-100 transition-colors"
              >
                <Edit2 className="h-4 w-4 text-blue-600" />
                <span>Edit</span>
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Results History */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">RECENT RESULTS HISTORY</h2>
          <span className="text-sm font-bold text-slate-500">{recentResults.length} Entries Recorded</span>
        </div>

        {recentResults.length === 0 ? (
          <p className="py-6 text-base text-slate-500">No results recorded yet.</p>
        ) : (
          <div className="divide-y divide-slate-200 border-t border-b border-slate-200">
            {recentResults.map((res) => (
              <div key={res.id} className="py-4 px-2 space-y-2 hover:bg-slate-100/40 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="text-base sm:text-lg font-black text-slate-900">{getEventName(res.eventId)}</span>
                    <span className="rounded-md bg-amber-100 px-2.5 py-0.5 text-xs font-black text-amber-900">
                      #{res.position} Place
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-mono text-lg font-black text-slate-900 pr-2">
                      +{res.points} PTS
                    </span>

                    <Link
                      to={
                        res.participantName
                          ? `/admin/posters?name=${encodeURIComponent(res.participantName)}&team=${encodeURIComponent(getTeamName(res.teamId))}&eventName=${encodeURIComponent(getEventName(res.eventId))}&position=${res.position}&type=individual`
                          : `/admin/posters?name=${encodeURIComponent(getTeamName(res.teamId))}&eventName=${encodeURIComponent(getEventName(res.eventId))}&position=${res.position}&type=team`
                      }
                      className="rounded-xl border border-amber-300 bg-amber-100 px-3 py-1.5 text-xs font-black text-amber-950 hover:bg-amber-200 transition-colors flex items-center gap-1"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Poster</span>
                    </Link>

                    <button
                      onClick={() => setEditingResult(res)}
                      className="rounded-xl border border-slate-300 bg-white p-2 text-slate-700 hover:bg-slate-100 transition-colors"
                      title="Edit Result"
                    >
                      <Edit2 className="h-4 w-4 text-blue-600" />
                    </button>

                    <button
                      onClick={() => setDeletingResult(res)}
                      className="rounded-xl border border-red-200 bg-red-50 p-2 text-red-700 hover:bg-red-100 transition-colors"
                      title="Delete Result"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-slate-600">
                  {res.participantName && (
                    <span>Participant: <strong className="text-slate-900">{res.participantName}</strong></span>
                  )}
                  <span>Team: <strong className="text-slate-900">{getTeamName(res.teamId)}</strong></span>
                  {res.createdAt && (
                    <span className="flex items-center gap-1 text-slate-500">
                      <Clock className="h-3.5 w-3.5" /> {new Date(res.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Starting Points Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">STARTING POINTS ADJUSTMENTS</h2>
          <button
            onClick={() => setIsAdjustmentModalOpen(true)}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-800 hover:bg-slate-100 transition-colors"
          >
            + Add Adjustment
          </button>
        </div>

        {adjustments.length === 0 ? (
          <p className="py-4 text-base text-slate-500">No starting adjustments recorded.</p>
        ) : (
          <div className="divide-y divide-slate-200 border-t border-b border-slate-200">
            {adjustments.map((adj) => (
              <div key={adj.id} className="py-4 px-2 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-extrabold text-slate-900">{getTeamName(adj.teamId)}</span>
                    <span className={`font-mono text-base font-black ${adj.points >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                      {adj.points >= 0 ? `+${adj.points}` : adj.points} PTS
                    </span>
                  </div>
                  <p className="text-sm font-medium text-slate-500 mt-0.5">{adj.reason || 'Initial standings — pre-system results'}</p>
                </div>

                <button
                  onClick={() => setDeletingAdjustment(adj)}
                  className="rounded-xl border border-red-200 bg-red-50 p-2 text-red-700 hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

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
