import type {
  IStandingsRepository,
  IScoringRepository,
  ITeamRepository,
  IResultRepository,
  IEventRepository,
  IStandingsAdjustmentRepository,
} from '../interfaces';
import type { Team, Result, ScoringRule, TeamStanding, SportsEvent, StandingsAdjustment } from '../../../types/models';
import { INITIAL_TEAMS, INITIAL_RESULTS, INITIAL_SCORING_RULES, INITIAL_EVENTS, INITIAL_ADJUSTMENTS } from '../../mock/seedData';
import { calculateStandings } from '../../../services/scoringEngine';

type SubscriberCallback = (data: { standings: TeamStanding[]; lastUpdated: string }) => void;

class MockRepositoryStore
  implements
    IStandingsRepository,
    IScoringRepository,
    ITeamRepository,
    IResultRepository,
    IEventRepository,
    IStandingsAdjustmentRepository
{
  private teams: Team[] = [...INITIAL_TEAMS];
  private results: Result[] = [...INITIAL_RESULTS];
  private scoringRules: ScoringRule[] = [...INITIAL_SCORING_RULES];
  private events: SportsEvent[] = [...INITIAL_EVENTS];
  private adjustments: StandingsAdjustment[] = [...INITIAL_ADJUSTMENTS];
  private lastUpdated: string = new Date().toISOString();
  private subscribers: Set<SubscriberCallback> = new Set();

  // --- ITeamRepository ---
  async getTeams(): Promise<Team[]> {
    return [...this.teams];
  }

  async getTeamById(id: string): Promise<Team | null> {
    return this.teams.find(t => t.id === id) || null;
  }

  // --- IEventRepository ---
  async getEvents(): Promise<SportsEvent[]> {
    return [...this.events];
  }

  async getEventById(id: string): Promise<SportsEvent | null> {
    return this.events.find(e => e.id === id) || null;
  }

  async createEvent(eventData: Omit<SportsEvent, 'id' | 'createdAt'>): Promise<SportsEvent> {
    const newEvent: SportsEvent = {
      ...eventData,
      id: `event-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.events.unshift(newEvent);
    this.lastUpdated = new Date().toISOString();
    return newEvent;
  }

  async editEvent(eventId: string, eventData: Partial<SportsEvent>): Promise<SportsEvent> {
    const idx = this.events.findIndex(e => e.id === eventId);
    if (idx === -1) throw new Error('Event not found.');
    this.events[idx] = { ...this.events[idx], ...eventData };
    this.lastUpdated = new Date().toISOString();
    return this.events[idx];
  }

  // --- IResultRepository ---
  async getResults(): Promise<Result[]> {
    return [...this.results];
  }

  async getResultsByEvent(eventId: string): Promise<Result[]> {
    return this.results.filter(r => r.eventId === eventId);
  }

  async getResultsByTeam(teamId: string): Promise<Result[]> {
    return this.results.filter(r => r.teamId === teamId);
  }

  async addResult(result: Omit<Result, 'id' | 'createdAt'>): Promise<Result> {
    const existingTeam = this.results.find(r => r.eventId === result.eventId && r.teamId === result.teamId);
    if (existingTeam) {
      throw new Error('This team has already recorded a result for this event.');
    }

    const existingPos = this.results.find(r => r.eventId === result.eventId && r.position === result.position);
    if (existingPos) {
      throw new Error(`Position #${result.position} has already been awarded in this event.`);
    }

    const rule = this.scoringRules.find(r => r.position === result.position);
    const newResult: Result = {
      ...result,
      id: `res-${Date.now()}`,
      points: result.points ?? (rule ? rule.points : 0),
      createdAt: new Date().toISOString(),
    };
    this.results.unshift(newResult);
    this.lastUpdated = new Date().toISOString();
    this.notifySubscribers();
    return newResult;
  }

  async editResult(resultId: string, resultData: Partial<Result>): Promise<Result> {
    const idx = this.results.findIndex(r => r.id === resultId);
    if (idx === -1) throw new Error('Result not found.');
    
    const current = this.results[idx];
    const newPos = resultData.position ?? current.position;
    const rule = this.scoringRules.find(r => r.position === newPos);
    
    this.results[idx] = {
      ...current,
      ...resultData,
      points: resultData.points ?? (rule ? rule.points : current.points),
    };

    this.lastUpdated = new Date().toISOString();
    this.notifySubscribers();
    return this.results[idx];
  }

  async deleteResult(resultId: string): Promise<void> {
    this.results = this.results.filter(r => r.id !== resultId);
    this.lastUpdated = new Date().toISOString();
    this.notifySubscribers();
  }

  // --- IScoringRepository ---
  async getScoringRules(): Promise<ScoringRule[]> {
    return [...this.scoringRules];
  }

  async updateScoringRules(rules: ScoringRule[]): Promise<void> {
    this.scoringRules = [...rules];
    this.lastUpdated = new Date().toISOString();
    this.notifySubscribers();
  }

  // --- IStandingsAdjustmentRepository ---
  async getAdjustments(): Promise<StandingsAdjustment[]> {
    return [...this.adjustments];
  }

  async createAdjustment(adjData: Omit<StandingsAdjustment, 'id' | 'createdAt'>): Promise<StandingsAdjustment> {
    const newAdj: StandingsAdjustment = {
      ...adjData,
      id: `adj-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.adjustments.push(newAdj);
    this.lastUpdated = new Date().toISOString();
    this.notifySubscribers();
    return newAdj;
  }

  async deleteAdjustment(adjustmentId: string): Promise<void> {
    this.adjustments = this.adjustments.filter(a => a.id !== adjustmentId);
    this.lastUpdated = new Date().toISOString();
    this.notifySubscribers();
  }

  // --- IAuthorizedAdminRepository ---
  private admins: { id: string; email: string; name?: string; active: boolean; createdAt: string }[] = [
    { id: 'adm-1', email: 'admin@example.com', name: 'Primary Admin', active: true, createdAt: new Date().toISOString() }
  ];

  async getAuthorizedAdmins(): Promise<{ id: string; email: string; name?: string; active: boolean; createdAt: string }[]> {
    return [...this.admins];
  }

  async addAuthorizedAdmin(email: string, name?: string): Promise<{ id: string; email: string; name?: string; active: boolean; createdAt: string }> {
    const newAdmin = {
      id: `adm-${Date.now()}`,
      email: email.trim().toLowerCase(),
      name: name?.trim() || undefined,
      active: true,
      createdAt: new Date().toISOString(),
    };
    this.admins.unshift(newAdmin);
    return newAdmin;
  }

  async toggleAuthorizedAdmin(id: string, active: boolean): Promise<void> {
    const adm = this.admins.find(a => a.id === id);
    if (adm) adm.active = active;
  }

  // --- IStandingsRepository ---
  async getStandings(): Promise<TeamStanding[]> {
    return calculateStandings(this.teams, this.results, this.scoringRules, this.adjustments);
  }

  async getLastUpdated(): Promise<string> {
    return this.lastUpdated;
  }

  subscribeToStandings(callback: (standings: TeamStanding[]) => void): () => void {
    const wrappedCallback: SubscriberCallback = (data) => {
      callback(data.standings);
    };
    this.subscribers.add(wrappedCallback);
    
    return () => {
      this.subscribers.delete(wrappedCallback);
    };
  }

  async resetToSeed(): Promise<void> {
    this.teams = [...INITIAL_TEAMS];
    this.results = [...INITIAL_RESULTS];
    this.scoringRules = [...INITIAL_SCORING_RULES];
    this.events = [...INITIAL_EVENTS];
    this.adjustments = [...INITIAL_ADJUSTMENTS];
    this.lastUpdated = new Date().toISOString();
    this.notifySubscribers();
  }

  private notifySubscribers() {
    const standings = calculateStandings(this.teams, this.results, this.scoringRules, this.adjustments);
    const payload = { standings, lastUpdated: this.lastUpdated };
    this.subscribers.forEach(cb => cb(payload));
  }
}

export const mockRepositoryStore = new MockRepositoryStore();
