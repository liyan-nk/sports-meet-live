import { mockRepositoryStore } from './mock/MockStandingsRepository';
import { supabaseStandingsRepository } from './supabase/SupabaseStandingsRepository';
import { isSupabaseConfigured } from '../../lib/supabase';

/**
 * Data Repository Registry.
 * 
 * Automatically selects Supabase Production Repository when VITE_SUPABASE_URL is set,
 * or cleanly falls back to MockRepositoryStore for local offline development & testing.
 */
export const standingsRepository = isSupabaseConfigured
  ? supabaseStandingsRepository
  : mockRepositoryStore;

export const scoringRepository = isSupabaseConfigured
  ? supabaseStandingsRepository
  : mockRepositoryStore;

export const teamRepository = isSupabaseConfigured
  ? supabaseStandingsRepository
  : mockRepositoryStore;

export const resultRepository = isSupabaseConfigured
  ? supabaseStandingsRepository
  : mockRepositoryStore;

export const eventRepository = isSupabaseConfigured
  ? supabaseStandingsRepository
  : mockRepositoryStore;

export const adjustmentRepository = isSupabaseConfigured
  ? supabaseStandingsRepository
  : mockRepositoryStore;

export const adminRepository = isSupabaseConfigured
  ? supabaseStandingsRepository
  : mockRepositoryStore;
