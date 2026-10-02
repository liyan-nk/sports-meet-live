import { mockRepositoryStore } from './mock/MockStandingsRepository';
import { appwriteStandingsRepository } from './appwrite/AppwriteStandingsRepository';
import { isAppwriteConfigured } from '../../lib/appwrite';

/**
 * Data Repository Registry.
 * 
 * Automatically selects Appwrite Production Repository when VITE_APPWRITE_PROJECT_ID is set,
 * or cleanly falls back to MockRepositoryStore for local offline development & testing.
 */
export const standingsRepository = isAppwriteConfigured
  ? appwriteStandingsRepository
  : mockRepositoryStore;

export const scoringRepository = isAppwriteConfigured
  ? appwriteStandingsRepository
  : mockRepositoryStore;

export const teamRepository = isAppwriteConfigured
  ? appwriteStandingsRepository
  : mockRepositoryStore;

export const resultRepository = isAppwriteConfigured
  ? appwriteStandingsRepository
  : mockRepositoryStore;

export const eventRepository = isAppwriteConfigured
  ? appwriteStandingsRepository
  : mockRepositoryStore;

export const adjustmentRepository = isAppwriteConfigured
  ? appwriteStandingsRepository
  : mockRepositoryStore;

export const adminRepository = isAppwriteConfigured
  ? appwriteStandingsRepository
  : mockRepositoryStore;
