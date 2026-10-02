import { Client, Databases, Account } from 'appwrite';

export const APPWRITE_ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
export const APPWRITE_PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID || '';
export const APPWRITE_DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID || 'sports_meet_db';

export const isAppwriteConfigured = Boolean(
  import.meta.env.VITE_APPWRITE_PROJECT_ID && import.meta.env.VITE_APPWRITE_PROJECT_ID.trim() !== ''
);

export const client = new Client();
if (isAppwriteConfigured) {
  client.setEndpoint(APPWRITE_ENDPOINT).setProject(APPWRITE_PROJECT_ID);
}

export const databases = new Databases(client);
export const account = new Account(client);

// Collection ID constants
export const COLLECTIONS = {
  TEAMS: import.meta.env.VITE_APPWRITE_COLLECTION_TEAMS || 'teams',
  EVENTS: import.meta.env.VITE_APPWRITE_COLLECTION_EVENTS || 'events',
  SCORING_RULES: import.meta.env.VITE_APPWRITE_COLLECTION_SCORING_RULES || 'scoring_rules',
  RESULTS: import.meta.env.VITE_APPWRITE_COLLECTION_RESULTS || 'results',
  ADJUSTMENTS: import.meta.env.VITE_APPWRITE_COLLECTION_ADJUSTMENTS || 'standings_adjustments',
  AUTHORIZED_ADMINS: import.meta.env.VITE_APPWRITE_COLLECTION_ADMINS || 'authorized_admins',
};
