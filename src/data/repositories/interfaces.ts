import type { Team, SportsEvent, Result, ScoringRule, TeamStanding, StandingsAdjustment, AuthorizedAdmin } from '../../types/models';

export interface ITeamRepository {
  getTeams(): Promise<Team[]>;
  getTeamById(id: string): Promise<Team | null>;
}

export interface IEventRepository {
  getEvents(): Promise<SportsEvent[]>;
  getEventById(id: string): Promise<SportsEvent | null>;
  createEvent?(event: Omit<SportsEvent, 'id' | 'createdAt'>): Promise<SportsEvent>;
  editEvent?(eventId: string, eventData: Partial<SportsEvent>): Promise<SportsEvent>;
}

export interface IResultRepository {
  getResults(): Promise<Result[]>;
  getResultsByEvent(eventId: string): Promise<Result[]>;
  getResultsByTeam(teamId: string): Promise<Result[]>;
  addResult?(result: Omit<Result, 'id' | 'createdAt'>): Promise<Result>;
  editResult?(resultId: string, resultData: Partial<Result>): Promise<Result>;
  deleteResult?(resultId: string): Promise<void>;
}

export interface IScoringRepository {
  getScoringRules(): Promise<ScoringRule[]>;
  updateScoringRules?(rules: ScoringRule[]): Promise<void>;
}

export interface IStandingsAdjustmentRepository {
  getAdjustments(): Promise<StandingsAdjustment[]>;
  createAdjustment?(adjustment: Omit<StandingsAdjustment, 'id' | 'createdAt'>): Promise<StandingsAdjustment>;
  deleteAdjustment?(adjustmentId: string): Promise<void>;
}

export interface IAuthorizedAdminRepository {
  getAuthorizedAdmins?(): Promise<AuthorizedAdmin[]>;
  addAuthorizedAdmin?(email: string, name?: string): Promise<AuthorizedAdmin>;
  toggleAuthorizedAdmin?(id: string, active: boolean): Promise<void>;
}

export interface IStandingsRepository {
  getStandings(): Promise<TeamStanding[]>;
  getLastUpdated(): Promise<string>;
  subscribeToStandings?(callback: (standings: TeamStanding[]) => void): () => void;
}
