-- ==============================================================================
-- MIGRATION 002: Add optional participant_name to results table
-- Description: Supports individual event participant names while keeping team events optional.
-- ==============================================================================

alter table public.results add column if not exists participant_name text;
