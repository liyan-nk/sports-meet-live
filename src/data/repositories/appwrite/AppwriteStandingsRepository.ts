import type {
  ITeamRepository,
  IEventRepository,
  IResultRepository,
  IScoringRepository,
  IStandingsRepository,
  IStandingsAdjustmentRepository,
  IAuthorizedAdminRepository,
} from '../interfaces';
import type { Team, SportsEvent, Result, ScoringRule, TeamStanding, StandingsAdjustment, AuthorizedAdmin } from '../../../types/models';
import { databases, client, isAppwriteConfigured, APPWRITE_DATABASE_ID, COLLECTIONS } from '../../../lib/appwrite';
import { calculateStandings } from '../../../services/scoringEngine';
import { Query, ID } from 'appwrite';

export class AppwriteStandingsRepository
  implements
    ITeamRepository,
    IEventRepository,
    IResultRepository,
    IScoringRepository,
    IStandingsRepository,
    IStandingsAdjustmentRepository,
    IAuthorizedAdminRepository
{
  // --- ITeamRepository ---
  async getTeams(): Promise<Team[]> {
    if (!isAppwriteConfigured) return [];
    try {
      const response = await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        COLLECTIONS.TEAMS,
        [Query.limit(100)]
      );
      return response.documents.map((doc: any) => ({
        id: doc.$id || doc.id,
        name: doc.name,
        code: doc.code,
        color: doc.color,
        secondaryColor: doc.secondaryColor,
        logoUrl: doc.logoUrl,
        createdAt: doc.$createdAt || doc.createdAt || new Date().toISOString(),
      }));
    } catch (err) {
      console.warn('Failed to fetch teams from Appwrite:', err);
      return [];
    }
  }

  async getTeamById(id: string): Promise<Team | null> {
    if (!isAppwriteConfigured) return null;
    try {
      const doc: any = await databases.getDocument(
        APPWRITE_DATABASE_ID,
        COLLECTIONS.TEAMS,
        id
      );
      return {
        id: doc.$id,
        name: doc.name,
        code: doc.code,
        color: doc.color,
        secondaryColor: doc.secondaryColor,
        logoUrl: doc.logoUrl,
        createdAt: doc.$createdAt || new Date().toISOString(),
      };
    } catch {
      return null;
    }
  }

  // --- IEventRepository ---
  async getEvents(): Promise<SportsEvent[]> {
    if (!isAppwriteConfigured) return [];
    try {
      const response = await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        COLLECTIONS.EVENTS,
        [Query.limit(100)]
      );
      return response.documents.map((doc: any) => ({
        id: doc.$id || doc.id,
        name: doc.name,
        category: doc.category,
        scheduledAt: doc.scheduledAt,
        status: doc.status,
        createdAt: doc.$createdAt || doc.createdAt || new Date().toISOString(),
      }));
    } catch (err) {
      console.warn('Failed to fetch events from Appwrite:', err);
      return [];
    }
  }

  async getEventById(id: string): Promise<SportsEvent | null> {
    if (!isAppwriteConfigured) return null;
    try {
      const doc: any = await databases.getDocument(
        APPWRITE_DATABASE_ID,
        COLLECTIONS.EVENTS,
        id
      );
      return {
        id: doc.$id,
        name: doc.name,
        category: doc.category,
        scheduledAt: doc.scheduledAt,
        status: doc.status,
        createdAt: doc.$createdAt || new Date().toISOString(),
      };
    } catch {
      return null;
    }
  }

  async createEvent(eventData: Omit<SportsEvent, 'id' | 'createdAt'>): Promise<SportsEvent> {
    if (!isAppwriteConfigured) throw new Error('Appwrite is not configured.');
    const doc: any = await databases.createDocument(
      APPWRITE_DATABASE_ID,
      COLLECTIONS.EVENTS,
      ID.unique(),
      {
        name: eventData.name,
        category: eventData.category,
        status: eventData.status || 'completed',
        scheduledAt: eventData.scheduledAt || null,
        createdAt: new Date().toISOString(),
      }
    );
    return {
      id: doc.$id,
      name: doc.name,
      category: doc.category,
      scheduledAt: doc.scheduledAt,
      status: doc.status,
      createdAt: doc.$createdAt || doc.createdAt,
    };
  }

  async editEvent(eventId: string, eventData: Partial<SportsEvent>): Promise<SportsEvent> {
    if (!isAppwriteConfigured) throw new Error('Appwrite is not configured.');
    const payload: Record<string, any> = {};
    if (eventData.name !== undefined) payload.name = eventData.name;
    if (eventData.category !== undefined) payload.category = eventData.category;
    if (eventData.status !== undefined) payload.status = eventData.status;
    if (eventData.scheduledAt !== undefined) payload.scheduledAt = eventData.scheduledAt;

    const doc: any = await databases.updateDocument(
      APPWRITE_DATABASE_ID,
      COLLECTIONS.EVENTS,
      eventId,
      payload
    );
    return {
      id: doc.$id,
      name: doc.name,
      category: doc.category,
      scheduledAt: doc.scheduledAt,
      status: doc.status,
      createdAt: doc.$createdAt || doc.createdAt,
    };
  }

  // --- IResultRepository ---
  async getResults(): Promise<Result[]> {
    if (!isAppwriteConfigured) return [];
    try {
      const response = await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        COLLECTIONS.RESULTS,
        [Query.limit(100)]
      );
      return response.documents.map((doc: any) => ({
        id: doc.$id || doc.id,
        eventId: doc.eventId,
        teamId: doc.teamId,
        position: doc.position,
        points: doc.points,
        participantName: doc.participantName || undefined,
        createdBy: doc.createdBy,
        createdAt: doc.$createdAt || doc.createdAt || new Date().toISOString(),
      }));
    } catch (err) {
      console.warn('Failed to fetch results from Appwrite:', err);
      return [];
    }
  }

  async getResultsByEvent(eventId: string): Promise<Result[]> {
    if (!isAppwriteConfigured) return [];
    try {
      const response = await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        COLLECTIONS.RESULTS,
        [Query.equal('eventId', eventId), Query.limit(100)]
      );
      return response.documents.map((doc: any) => ({
        id: doc.$id || doc.id,
        eventId: doc.eventId,
        teamId: doc.teamId,
        position: doc.position,
        points: doc.points,
        participantName: doc.participantName || undefined,
        createdBy: doc.createdBy,
        createdAt: doc.$createdAt || doc.createdAt || new Date().toISOString(),
      }));
    } catch {
      return [];
    }
  }

  async getResultsByTeam(teamId: string): Promise<Result[]> {
    if (!isAppwriteConfigured) return [];
    try {
      const response = await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        COLLECTIONS.RESULTS,
        [Query.equal('teamId', teamId), Query.limit(100)]
      );
      return response.documents.map((doc: any) => ({
        id: doc.$id || doc.id,
        eventId: doc.eventId,
        teamId: doc.teamId,
        position: doc.position,
        points: doc.points,
        participantName: doc.participantName || undefined,
        createdBy: doc.createdBy,
        createdAt: doc.$createdAt || doc.createdAt || new Date().toISOString(),
      }));
    } catch {
      return [];
    }
  }

  async addResult(resultData: Omit<Result, 'id' | 'createdAt'>): Promise<Result> {
    if (!isAppwriteConfigured) throw new Error('Appwrite is not configured.');
    
    // Check duplicates
    const existing = await this.getResultsByEvent(resultData.eventId);
    if (existing.some(r => r.teamId === resultData.teamId)) {
      throw new Error('This team has already recorded a result for this event.');
    }
    if (existing.some(r => r.position === resultData.position)) {
      throw new Error(`Position #${resultData.position} has already been awarded in this event.`);
    }

    let awardedPoints = resultData.points;
    if (awardedPoints === undefined) {
      const rules = await this.getScoringRules();
      const rule = rules.find(r => r.position === resultData.position);
      awardedPoints = rule ? rule.points : 0;
    }

    const doc: any = await databases.createDocument(
      APPWRITE_DATABASE_ID,
      COLLECTIONS.RESULTS,
      ID.unique(),
      {
        eventId: resultData.eventId,
        teamId: resultData.teamId,
        position: resultData.position,
        points: awardedPoints,
        participantName: resultData.participantName?.trim() || null,
        createdBy: resultData.createdBy || null,
        createdAt: new Date().toISOString(),
      }
    );

    return {
      id: doc.$id,
      eventId: doc.eventId,
      teamId: doc.teamId,
      position: doc.position,
      points: doc.points,
      participantName: doc.participantName || undefined,
      createdBy: doc.createdBy,
      createdAt: doc.$createdAt || doc.createdAt,
    };
  }

  async editResult(resultId: string, resultData: Partial<Result>): Promise<Result> {
    if (!isAppwriteConfigured) throw new Error('Appwrite is not configured.');
    const payload: Record<string, any> = {};

    if (resultData.position !== undefined) payload.position = resultData.position;
    if (resultData.teamId !== undefined) payload.teamId = resultData.teamId;
    if (resultData.eventId !== undefined) payload.eventId = resultData.eventId;
    if (resultData.points !== undefined) payload.points = resultData.points;
    if (resultData.participantName !== undefined) {
      payload.participantName = resultData.participantName.trim() || null;
    }

    const doc: any = await databases.updateDocument(
      APPWRITE_DATABASE_ID,
      COLLECTIONS.RESULTS,
      resultId,
      payload
    );

    return {
      id: doc.$id,
      eventId: doc.eventId,
      teamId: doc.teamId,
      position: doc.position,
      points: doc.points,
      participantName: doc.participantName || undefined,
      createdBy: doc.createdBy,
      createdAt: doc.$createdAt || doc.createdAt,
    };
  }

  async deleteResult(resultId: string): Promise<void> {
    if (!isAppwriteConfigured) throw new Error('Appwrite is not configured.');
    await databases.deleteDocument(
      APPWRITE_DATABASE_ID,
      COLLECTIONS.RESULTS,
      resultId
    );
  }

  // --- IScoringRepository ---
  async getScoringRules(): Promise<ScoringRule[]> {
    if (!isAppwriteConfigured) return [];
    try {
      const response = await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        COLLECTIONS.SCORING_RULES,
        [Query.limit(100)]
      );
      return response.documents.map((doc: any) => ({
        id: doc.$id || doc.id,
        position: doc.position,
        points: doc.points,
        label: doc.label,
      })).sort((a, b) => a.position - b.position);
    } catch (err) {
      console.warn('Failed to fetch scoring rules from Appwrite:', err);
      return [];
    }
  }

  async updateScoringRules(rules: ScoringRule[]): Promise<void> {
    if (!isAppwriteConfigured) throw new Error('Appwrite is not configured.');
    const existingRules = await this.getScoringRules();

    for (const rule of rules) {
      const existingDoc = existingRules.find(r => r.position === rule.position);
      if (existingDoc) {
        await databases.updateDocument(
          APPWRITE_DATABASE_ID,
          COLLECTIONS.SCORING_RULES,
          existingDoc.id,
          { points: rule.points, label: rule.label || `Rank #${rule.position}` }
        );
      } else {
        await databases.createDocument(
          APPWRITE_DATABASE_ID,
          COLLECTIONS.SCORING_RULES,
          ID.unique(),
          { position: rule.position, points: rule.points, label: rule.label || `Rank #${rule.position}` }
        );
      }
    }
  }

  // --- IStandingsAdjustmentRepository ---
  async getAdjustments(): Promise<StandingsAdjustment[]> {
    if (!isAppwriteConfigured) return [];
    try {
      const response = await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        COLLECTIONS.ADJUSTMENTS,
        [Query.limit(100)]
      );
      return response.documents.map((doc: any) => ({
        id: doc.$id || doc.id,
        teamId: doc.teamId,
        points: doc.points,
        reason: doc.reason,
        createdBy: doc.createdBy,
        createdAt: doc.$createdAt || doc.createdAt || new Date().toISOString(),
      }));
    } catch (err) {
      console.warn('Failed to fetch adjustments from Appwrite:', err);
      return [];
    }
  }

  async createAdjustment(adjData: Omit<StandingsAdjustment, 'id' | 'createdAt'>): Promise<StandingsAdjustment> {
    if (!isAppwriteConfigured) throw new Error('Appwrite is not configured.');
    const doc: any = await databases.createDocument(
      APPWRITE_DATABASE_ID,
      COLLECTIONS.ADJUSTMENTS,
      ID.unique(),
      {
        teamId: adjData.teamId,
        points: adjData.points,
        reason: adjData.reason,
        createdBy: adjData.createdBy || null,
        createdAt: new Date().toISOString(),
      }
    );
    return {
      id: doc.$id,
      teamId: doc.teamId,
      points: doc.points,
      reason: doc.reason,
      createdBy: doc.createdBy,
      createdAt: doc.$createdAt || doc.createdAt,
    };
  }

  async deleteAdjustment(adjustmentId: string): Promise<void> {
    if (!isAppwriteConfigured) throw new Error('Appwrite is not configured.');
    await databases.deleteDocument(
      APPWRITE_DATABASE_ID,
      COLLECTIONS.ADJUSTMENTS,
      adjustmentId
    );
  }

  // --- IAuthorizedAdminRepository ---
  async getAuthorizedAdmins(): Promise<AuthorizedAdmin[]> {
    if (!isAppwriteConfigured) return [];
    try {
      const response = await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        COLLECTIONS.AUTHORIZED_ADMINS,
        [Query.limit(100)]
      );
      return response.documents.map((doc: any) => ({
        id: doc.$id || doc.id,
        email: doc.email,
        name: doc.name,
        active: doc.active,
        createdAt: doc.$createdAt || doc.createdAt || new Date().toISOString(),
      }));
    } catch {
      return [];
    }
  }

  async addAuthorizedAdmin(email: string, name?: string): Promise<AuthorizedAdmin> {
    if (!isAppwriteConfigured) throw new Error('Appwrite is not configured.');
    const doc: any = await databases.createDocument(
      APPWRITE_DATABASE_ID,
      COLLECTIONS.AUTHORIZED_ADMINS,
      ID.unique(),
      {
        email: email.trim().toLowerCase(),
        name: name?.trim() || null,
        active: true,
        createdAt: new Date().toISOString(),
      }
    );
    return {
      id: doc.$id,
      email: doc.email,
      name: doc.name,
      active: doc.active,
      createdAt: doc.$createdAt || doc.createdAt,
    };
  }

  async toggleAuthorizedAdmin(id: string, active: boolean): Promise<void> {
    if (!isAppwriteConfigured) throw new Error('Appwrite is not configured.');
    await databases.updateDocument(
      APPWRITE_DATABASE_ID,
      COLLECTIONS.AUTHORIZED_ADMINS,
      id,
      { active }
    );
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
    if (!isAppwriteConfigured) return new Date().toISOString();
    try {
      const response = await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        COLLECTIONS.RESULTS,
        [Query.orderDesc('$createdAt'), Query.limit(1)]
      );
      return response.documents[0]?.$createdAt || new Date().toISOString();
    } catch {
      return new Date().toISOString();
    }
  }

  subscribeToStandings(callback: (standings: TeamStanding[]) => void): () => void {
    if (!isAppwriteConfigured) return () => {};

    try {
      const channel = `databases.${APPWRITE_DATABASE_ID}.collections.${COLLECTIONS.RESULTS}.documents`;
      const unsubscribe = client.subscribe(channel, async () => {
        const updatedStandings = await this.getStandings();
        callback(updatedStandings);
      });
      return unsubscribe;
    } catch (err) {
      console.warn('Failed to subscribe to Appwrite realtime updates:', err);
      return () => {};
    }
  }
}

export const appwriteStandingsRepository = new AppwriteStandingsRepository();
