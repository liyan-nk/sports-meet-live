import type { Team, SportsEvent, Result, ScoringRule, StandingsAdjustment } from '../../types/models';

export const INITIAL_TEAMS: Team[] = [
  {
    id: 'team-vertex',
    name: 'Vertex',
    code: 'VTX',
    createdAt: '2026-10-01T08:00:00Z',
  },
  {
    id: 'team-zenith',
    name: 'Zenith',
    code: 'ZNT',
    createdAt: '2026-10-01T08:00:00Z',
  },
  {
    id: 'team-astra',
    name: 'Astra',
    code: 'AST',
    createdAt: '2026-10-01T08:00:00Z',
  },
  {
    id: 'team-nova',
    name: 'Nova',
    code: 'NOV',
    createdAt: '2026-10-01T08:00:00Z',
  },
];

export const INITIAL_SCORING_RULES: ScoringRule[] = [
  { id: 'rule-1', position: 1, points: 10, label: '1st Place' },
  { id: 'rule-2', position: 2, points: 5, label: '2nd Place' },
  { id: 'rule-3', position: 3, points: 3, label: '3rd Place' },
  { id: 'rule-4', position: 4, points: 0, label: '4th Place' },
];

/**
 * Initial standings adjustments for pre-system starting points.
 * Vertex: 10 | Zenith: 5 | Astra: 3 | Nova: 0
 */
export const INITIAL_ADJUSTMENTS: StandingsAdjustment[] = [
  {
    id: 'adj-vertex-init',
    teamId: 'team-vertex',
    points: 10,
    reason: 'Initial standings — pre-system results',
    createdAt: '2026-10-01T08:00:00Z',
  },
  {
    id: 'adj-zenith-init',
    teamId: 'team-zenith',
    points: 5,
    reason: 'Initial standings — pre-system results',
    createdAt: '2026-10-01T08:00:00Z',
  },
  {
    id: 'adj-astra-init',
    teamId: 'team-astra',
    points: 3,
    reason: 'Initial standings — pre-system results',
    createdAt: '2026-10-01T08:00:00Z',
  },
  {
    id: 'adj-nova-init',
    teamId: 'team-nova',
    points: 0,
    reason: 'Initial standings — pre-system results',
    createdAt: '2026-10-01T08:00:00Z',
  },
];

export const INITIAL_EVENTS: SportsEvent[] = [
  {
    id: 'ev-100m-men',
    name: '100M Men',
    category: 'Track',
    status: 'completed',
    createdAt: '2026-10-01T09:00:00Z',
  },
  {
    id: 'ev-long-jump-men',
    name: 'Long Jump Men',
    category: 'Field',
    status: 'completed',
    createdAt: '2026-10-01T09:30:00Z',
  },
  {
    id: 'ev-200m-women',
    name: '200M Women',
    category: 'Track',
    status: 'completed',
    createdAt: '2026-10-01T10:00:00Z',
  },
  {
    id: 'ev-badminton-singles',
    name: 'Badminton Men Singles',
    category: 'Indoor',
    status: 'completed',
    createdAt: '2026-10-01T10:30:00Z',
  },
  {
    id: 'ev-football-men',
    name: 'Football Men',
    category: 'Team Sport',
    status: 'completed',
    createdAt: '2026-10-01T11:00:00Z',
  },
  {
    id: 'ev-volleyball-women',
    name: 'Volleyball Women',
    category: 'Team Sport',
    status: 'completed',
    createdAt: '2026-10-01T11:30:00Z',
  },
  {
    id: 'ev-4x100-relay',
    name: '4×100 Relay',
    category: 'Track',
    status: 'completed',
    createdAt: '2026-10-01T12:00:00Z',
  },
  {
    id: 'ev-shot-put-men',
    name: 'Shot Put Men',
    category: 'Field',
    status: 'completed',
    createdAt: '2026-10-01T12:30:00Z',
  },
];

export const INITIAL_RESULTS: Result[] = [
  // Event 1: 100M Men
  {
    id: 'res-100m-1',
    eventId: 'ev-100m-men',
    teamId: 'team-vertex',
    participantName: 'Liyan (S3 CSE)',
    position: 1,
    points: 10,
    createdAt: '2026-10-01T09:15:00Z',
  },
  {
    id: 'res-100m-2',
    eventId: 'ev-100m-men',
    teamId: 'team-zenith',
    participantName: 'Nihal (S1 AD)',
    position: 2,
    points: 5,
    createdAt: '2026-10-01T09:16:00Z',
  },
  {
    id: 'res-100m-3',
    eventId: 'ev-100m-men',
    teamId: 'team-astra',
    participantName: 'Shinas (S1 BBA)',
    position: 3,
    points: 3,
    createdAt: '2026-10-01T09:17:00Z',
  },

  // Event 2: Long Jump Men
  {
    id: 'res-lj-1',
    eventId: 'ev-long-jump-men',
    teamId: 'team-zenith',
    participantName: 'Azal (S1 CSE)',
    position: 1,
    points: 10,
    createdAt: '2026-10-01T09:45:00Z',
  },
  {
    id: 'res-lj-2',
    eventId: 'ev-long-jump-men',
    teamId: 'team-vertex',
    participantName: 'Rayyan (S2 CSE)',
    position: 2,
    points: 5,
    createdAt: '2026-10-01T09:46:00Z',
  },
  {
    id: 'res-lj-3',
    eventId: 'ev-long-jump-men',
    teamId: 'team-astra',
    participantName: 'Nihal (S1 AD)',
    position: 3,
    points: 3,
    createdAt: '2026-10-01T09:47:00Z',
  },

  // Event 3: 200M Women
  {
    id: 'res-200m-1',
    eventId: 'ev-200m-women',
    teamId: 'team-astra',
    participantName: 'Alya (S1 BBA)',
    position: 1,
    points: 10,
    createdAt: '2026-10-01T10:15:00Z',
  },
  {
    id: 'res-200m-2',
    eventId: 'ev-200m-women',
    teamId: 'team-nova',
    participantName: 'Fathima (S2 CSE)',
    position: 2,
    points: 5,
    createdAt: '2026-10-01T10:16:00Z',
  },
  {
    id: 'res-200m-3',
    eventId: 'ev-200m-women',
    teamId: 'team-zenith',
    participantName: 'Hiba (S1 AD)',
    position: 3,
    points: 3,
    createdAt: '2026-10-01T10:17:00Z',
  },

  // Event 4: Badminton Men Singles
  {
    id: 'res-badminton-1',
    eventId: 'ev-badminton-singles',
    teamId: 'team-astra',
    participantName: 'Shinas (S1 BBA)',
    position: 1,
    points: 10,
    createdAt: '2026-10-01T10:45:00Z',
  },
  {
    id: 'res-badminton-2',
    eventId: 'ev-badminton-singles',
    teamId: 'team-nova',
    participantName: 'Rayyan (S2 CSE)',
    position: 2,
    points: 5,
    createdAt: '2026-10-01T10:46:00Z',
  },
  {
    id: 'res-badminton-3',
    eventId: 'ev-badminton-singles',
    teamId: 'team-vertex',
    participantName: 'Liyan (S3 CSE)',
    position: 3,
    points: 3,
    createdAt: '2026-10-01T10:47:00Z',
  },

  // Event 5: Football Men (Team event - participantName is undefined/NULL)
  {
    id: 'res-football-1',
    eventId: 'ev-football-men',
    teamId: 'team-vertex',
    position: 1,
    points: 10,
    createdAt: '2026-10-01T11:15:00Z',
  },
  {
    id: 'res-football-2',
    eventId: 'ev-football-men',
    teamId: 'team-zenith',
    position: 2,
    points: 5,
    createdAt: '2026-10-01T11:16:00Z',
  },
  {
    id: 'res-football-3',
    eventId: 'ev-football-men',
    teamId: 'team-astra',
    position: 3,
    points: 3,
    createdAt: '2026-10-01T11:17:00Z',
  },

  // Event 6: Volleyball Women (Team event)
  {
    id: 'res-volleyball-1',
    eventId: 'ev-volleyball-women',
    teamId: 'team-astra',
    position: 1,
    points: 10,
    createdAt: '2026-10-01T11:45:00Z',
  },
  {
    id: 'res-volleyball-2',
    eventId: 'ev-volleyball-women',
    teamId: 'team-nova',
    position: 2,
    points: 5,
    createdAt: '2026-10-01T11:46:00Z',
  },
  {
    id: 'res-volleyball-3',
    eventId: 'ev-volleyball-women',
    teamId: 'team-zenith',
    position: 3,
    points: 3,
    createdAt: '2026-10-01T11:47:00Z',
  },

  // Event 7: 4×100 Relay (Team event)
  {
    id: 'res-relay-1',
    eventId: 'ev-4x100-relay',
    teamId: 'team-nova',
    position: 1,
    points: 10,
    createdAt: '2026-10-01T12:15:00Z',
  },
  {
    id: 'res-relay-2',
    eventId: 'ev-4x100-relay',
    teamId: 'team-vertex',
    position: 2,
    points: 5,
    createdAt: '2026-10-01T12:16:00Z',
  },
  {
    id: 'res-relay-3',
    eventId: 'ev-4x100-relay',
    teamId: 'team-zenith',
    position: 3,
    points: 3,
    createdAt: '2026-10-01T12:17:00Z',
  },

  // Event 8: Shot Put Men (Field event)
  {
    id: 'res-shotput-1',
    eventId: 'ev-shot-put-men',
    teamId: 'team-vertex',
    position: 1,
    points: 10,
    createdAt: '2026-10-01T12:45:00Z',
  },
  {
    id: 'res-shotput-2',
    eventId: 'ev-shot-put-men',
    teamId: 'team-astra',
    position: 2,
    points: 5,
    createdAt: '2026-10-01T12:46:00Z',
  },
  {
    id: 'res-shotput-3',
    eventId: 'ev-shot-put-men',
    teamId: 'team-nova',
    position: 3,
    points: 3,
    createdAt: '2026-10-01T12:47:00Z',
  },
];
