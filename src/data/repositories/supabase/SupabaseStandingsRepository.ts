import type {
  ITeamRepository,
  IEventRepository,
  IResultRepository,
  IScoringRepository,
  IStandingsRepository,
  IStandingsAdjustmentRepository,
} from '../interfaces';
import type { Team, SportsEvent, Result, ScoringRule, TeamStanding, StandingsAdjustment } from '../../../types/models';
import { supabase } from '../../../lib/supabase';
import { calculateStandings } from '../../../services/scoringEngine';

export class SupabaseStandingsRepository
  implements
    ITeamRepository,
    IEventRepository,
    IResultRepository,
    IScoringRepository,
    IStandingsRepository,
    IStandingsAdjustmentRepository
{
  // --- ITeamRepository ---
  async getTeams(): Promise<Team[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw new Error(`Failed to fetch teams: ${error.message}`);
    return (data || []).map(t => ({
      id: t.id,
      name: t.name,
      code: t.code,
      color: t.color,
      secondaryColor: t.secondary_color,
      logoUrl: t.logo_url,
      createdAt: t.created_at,
    }));
  }

  async getTeamById(id: string): Promise<Team | null> {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return {
      id: data.id,
      name: data.name,
      code: data.code,
      color: data.color,
      secondaryColor: data.secondary_color,
      logoUrl: data.logo_url,
      createdAt: data.created_at,
    };
  }

  // --- IEventRepository ---
  async getEvents(): Promise<SportsEvent[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch events: ${error.message}`);
    return (data || []).map(e => ({
      id: e.id,
      name: e.name,
      category: e.category,
      scheduledAt: e.scheduled_at,
      status: e.status,
      createdAt: e.created_at,
    }));
  }

  async getEventById(id: string): Promise<SportsEvent | null> {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return {
      id: data.id,
      name: data.name,
      category: data.category,
      scheduledAt: data.scheduled_at,
      status: data.status,
      createdAt: data.created_at,
    };
  }

  async createEvent(eventData: Omit<SportsEvent, 'id' | 'createdAt'>): Promise<SportsEvent> {
    if (!supabase) throw new Error('Supabase client is not configured.');
    const { data, error } = await supabase
      .from('events')
      .insert({
        name: eventData.name,
        category: eventData.category,
        status: eventData.status || 'completed',
        scheduled_at: eventData.scheduledAt,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create event: ${error.message}`);
    return {
      id: data.id,
      name: data.name,
      category: data.category,
      scheduledAt: data.scheduled_at,
      status: data.status,
      createdAt: data.created_at,
    };
  }

  async editEvent(eventId: string, eventData: Partial<SportsEvent>): Promise<SportsEvent> {
    if (!supabase) throw new Error('Supabase client is not configured.');
    const updatePayload: Record<string, any> = {};
    if (eventData.name !== undefined) updatePayload.name = eventData.name;
    if (eventData.category !== undefined) updatePayload.category = eventData.category;
    if (eventData.status !== undefined) updatePayload.status = eventData.status;
    if (eventData.scheduledAt !== undefined) updatePayload.scheduled_at = eventData.scheduledAt;

    const { data, error } = await supabase
      .from('events')
      .update(updatePayload)
      .eq('id', eventId)
      .select()
      .single();

    if (error) throw new Error(`Failed to update event: ${error.message}`);
    return {
      id: data.id,
      name: data.name,
      category: data.category,
      scheduledAt: data.scheduled_at,
      status: data.status,
      createdAt: data.created_at,
    };
  }

  // --- IResultRepository ---
  async getResults(): Promise<Result[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('results')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch results: ${error.message}`);
    return (data || []).map(r => ({
      id: r.id,
      eventId: r.event_id,
      teamId: r.team_id,
      position: r.position,
      points: r.points,
      participantName: r.participant_name || undefined,
      createdBy: r.created_by,
      createdAt: r.created_at,
    }));
  }

  async getResultsByEvent(eventId: string): Promise<Result[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('results')
      .select('*')
      .eq('event_id', eventId);

    if (error) throw new Error(`Failed to fetch event results: ${error.message}`);
    return (data || []).map(r => ({
      id: r.id,
      eventId: r.event_id,
      teamId: r.team_id,
      position: r.position,
      points: r.points,
      participantName: r.participant_name || undefined,
      createdBy: r.created_by,
      createdAt: r.created_at,
    }));
  }

  async getResultsByTeam(teamId: string): Promise<Result[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('results')
      .select('*')
      .eq('team_id', teamId);

    if (error) throw new Error(`Failed to fetch team results: ${error.message}`);
    return (data || []).map(r => ({
      id: r.id,
      eventId: r.event_id,
      teamId: r.team_id,
      position: r.position,
      points: r.points,
      participantName: r.participant_name || undefined,
      createdBy: r.created_by,
      createdAt: r.created_at,
    }));
  }

  async addResult(resultData: Omit<Result, 'id' | 'createdAt'>): Promise<Result> {
    if (!supabase) throw new Error('Supabase client is not configured.');
    
    let awardedPoints = resultData.points;
    if (awardedPoints === undefined) {
      const { data: ruleData } = await supabase
        .from('scoring_rules')
        .select('points')
        .eq('position', resultData.position)
        .single();
      awardedPoints = ruleData ? ruleData.points : 0;
    }

    const { data: userAuth } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('results')
      .insert({
        event_id: resultData.eventId,
        team_id: resultData.teamId,
        position: resultData.position,
        points: awardedPoints,
        participant_name: resultData.participantName?.trim() || null,
        created_by: userAuth.user?.email || null,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        if (error.message.includes('unique_event_team')) {
          throw new Error('This team has already recorded a result for this event.');
        }
        if (error.message.includes('unique_event_position')) {
          throw new Error(`Position #${resultData.position} has already been awarded in this event.`);
        }
      }
      throw new Error(`Failed to save result: ${error.message}`);
    }

    return {
      id: data.id,
      eventId: data.event_id,
      teamId: data.team_id,
      position: data.position,
      points: data.points,
      participantName: data.participant_name || undefined,
      createdBy: data.created_by,
      createdAt: data.created_at,
    };
  }

  async editResult(resultId: string, resultData: Partial<Result>): Promise<Result> {
    if (!supabase) throw new Error('Supabase client is not configured.');
    const payload: Record<string, any> = {};

    if (resultData.position !== undefined) {
      payload.position = resultData.position;
      const { data: ruleData } = await supabase
        .from('scoring_rules')
        .select('points')
        .eq('position', resultData.position)
        .single();
      payload.points = ruleData ? ruleData.points : (resultData.points || 0);
    }
    if (resultData.teamId !== undefined) payload.team_id = resultData.teamId;
    if (resultData.eventId !== undefined) payload.event_id = resultData.eventId;
    if (resultData.points !== undefined) payload.points = resultData.points;
    if (resultData.participantName !== undefined) {
      payload.participant_name = resultData.participantName.trim() || null;
    }

    const { data, error } = await supabase
      .from('results')
      .update(payload)
      .eq('id', resultId)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new Error('This event placement or team result conflict already exists.');
      }
      throw new Error(`Failed to update result: ${error.message}`);
    }

    return {
      id: data.id,
      eventId: data.event_id,
      teamId: data.team_id,
      position: data.position,
      points: data.points,
      participantName: data.participant_name || undefined,
      createdBy: data.created_by,
      createdAt: data.created_at,
    };
  }

  async deleteResult(resultId: string): Promise<void> {
    if (!supabase) throw new Error('Supabase client is not configured.');
    const { error } = await supabase
      .from('results')
      .delete()
      .eq('id', resultId);

    if (error) throw new Error(`Failed to delete result: ${error.message}`);
  }

  // --- IScoringRepository ---
  async getScoringRules(): Promise<ScoringRule[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('scoring_rules')
      .select('*')
      .order('position', { ascending: true });

    if (error) throw new Error(`Failed to fetch scoring rules: ${error.message}`);
    return (data || []).map(r => ({
      id: r.id,
      position: r.position,
      points: r.points,
      label: r.label,
    }));
  }

  async updateScoringRules(rules: ScoringRule[]): Promise<void> {
    if (!supabase) throw new Error('Supabase client is not configured.');
    
    for (const rule of rules) {
      const { error } = await supabase
        .from('scoring_rules')
        .upsert({
          position: rule.position,
          points: rule.points,
          label: rule.label,
        }, { onConflict: 'position' });

      if (error) throw new Error(`Failed to update scoring rule for position ${rule.position}: ${error.message}`);
    }
  }

  // --- IStandingsAdjustmentRepository ---
  async getAdjustments(): Promise<StandingsAdjustment[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('standings_adjustments')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw new Error(`Failed to fetch standings adjustments: ${error.message}`);
    return (data || []).map(a => ({
      id: a.id,
      teamId: a.team_id,
      points: a.points,
      reason: a.reason,
      createdBy: a.created_by,
      createdAt: a.created_at,
    }));
  }

  async createAdjustment(adjData: Omit<StandingsAdjustment, 'id' | 'createdAt'>): Promise<StandingsAdjustment> {
    if (!supabase) throw new Error('Supabase client is not configured.');
    const { data: userAuth } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('standings_adjustments')
      .insert({
        team_id: adjData.teamId,
        points: adjData.points,
        reason: adjData.reason,
        created_by: userAuth.user?.email || null,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create standings adjustment: ${error.message}`);
    return {
      id: data.id,
      teamId: data.team_id,
      points: data.points,
      reason: data.reason,
      createdBy: data.created_by,
      createdAt: data.created_at,
    };
  }

  async deleteAdjustment(adjustmentId: string): Promise<void> {
    if (!supabase) throw new Error('Supabase client is not configured.');
    const { error } = await supabase
      .from('standings_adjustments')
      .delete()
      .eq('id', adjustmentId);

    if (error) throw new Error(`Failed to delete standings adjustment: ${error.message}`);
  }

  // --- IAuthorizedAdminRepository ---
  async getAuthorizedAdmins(): Promise<{ id: string; email: string; name?: string; active: boolean; createdAt: string }[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('authorized_admins')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch admin whitelist: ${error.message}`);
    return (data || []).map(a => ({
      id: a.id,
      email: a.email,
      name: a.name,
      active: a.active,
      createdAt: a.created_at,
    }));
  }

  async addAuthorizedAdmin(email: string, name?: string): Promise<{ id: string; email: string; name?: string; active: boolean; createdAt: string }> {
    if (!supabase) throw new Error('Supabase client is not configured.');
    const { data, error } = await supabase
      .from('authorized_admins')
      .insert({
        email: email.trim().toLowerCase(),
        name: name?.trim() || null,
        active: true,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') throw new Error('This admin email is already in the whitelist.');
      throw new Error(`Failed to add authorized admin: ${error.message}`);
    }

    return {
      id: data.id,
      email: data.email,
      name: data.name,
      active: data.active,
      createdAt: data.created_at,
    };
  }

  async toggleAuthorizedAdmin(id: string, active: boolean): Promise<void> {
    if (!supabase) throw new Error('Supabase client is not configured.');
    const { error } = await supabase
      .from('authorized_admins')
      .update({ active })
      .eq('id', id);

    if (error) throw new Error(`Failed to update admin status: ${error.message}`);
  }

  // --- IStandingsRepository ---
  async getStandings(): Promise<TeamStanding[]> {
    const [teams, results, scoringRules, adjustments] = await Promise.all([
      this.getTeams(),
      this.getResults(),
      this.getScoringRules(),
      this.getAdjustments(),
    ]);

    return calculateStandings(teams, results, scoringRules, adjustments);
  }

  async getLastUpdated(): Promise<string> {
    if (!supabase) return new Date().toISOString();
    const { data } = await supabase
      .from('results')
      .select('created_at')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    return data ? data.created_at : new Date().toISOString();
  }

  subscribeToStandings(callback: (standings: TeamStanding[]) => void): () => void {
    if (!supabase) return () => {};

    const channel = supabase
      .channel('public:standings-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'results' }, async () => {
        const updatedStandings = await this.getStandings();
        callback(updatedStandings);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'standings_adjustments' }, async () => {
        const updatedStandings = await this.getStandings();
        callback(updatedStandings);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'scoring_rules' }, async () => {
        const updatedStandings = await this.getStandings();
        callback(updatedStandings);
      })
      .subscribe();

    return () => {
      supabase?.removeChannel(channel);
    };
  }
}

export const supabaseStandingsRepository = new SupabaseStandingsRepository();
