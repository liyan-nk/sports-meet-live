export interface Team {
  id: string;
  name: string;
  code: string;
  createdAt: string;
  color?: string;
  secondaryColor?: string;
  logoUrl?: string;
}

export interface EventCategory {
  id: string;
  name: string;
}

export interface SportsEvent {
  id: string;
  name: string;
  category: string;
  scheduledAt?: string;
  status?: 'upcoming' | 'ongoing' | 'completed' | 'live' | 'archived';
  createdAt: string;
}

export interface ScoringRule {
  id: string;
  position: number;
  points: number;
  label?: string;
}

export interface Result {
  id: string;
  eventId: string;
  teamId: string;
  position: number;
  points?: number;
  participantName?: string;
  createdBy?: string;
  createdAt: string;
}

export interface AuthorizedAdmin {
  id: string;
  email: string;
  name?: string;
  active: boolean;
  createdAt: string;
}

export interface StandingsAdjustment {
  id: string;
  teamId: string;
  points: number;
  reason: string;
  createdBy?: string;
  createdAt: string;
}

export interface TeamStanding {
  team: Team;
  totalPoints: number;
  adjustmentPoints: number;
  resultPoints: number;
  position: number; // Derived dynamically from totalPoints
  resultsCount: number;
  goldCount: number;
  silverCount: number;
  bronzeCount: number;
}

export interface StandingsData {
  standings: TeamStanding[];
  lastUpdated: string;
  scoringRules: ScoringRule[];
}
