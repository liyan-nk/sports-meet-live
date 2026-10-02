import { useState, useEffect, useCallback } from 'react';
import type { TeamStanding, ScoringRule } from '../types/models';
import { standingsRepository, scoringRepository } from '../data/repositories';

export interface UseStandingsResult {
  standings: TeamStanding[];
  scoringRules: ScoringRule[];
  lastUpdated: string | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useStandings(): UseStandingsResult {
  const [standings, setStandings] = useState<TeamStanding[]>([]);
  const [scoringRules, setScoringRules] = useState<ScoringRule[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStandingsData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [data, rules, updated] = await Promise.all([
        standingsRepository.getStandings(),
        scoringRepository.getScoringRules(),
        standingsRepository.getLastUpdated(),
      ]);
      setStandings(data);
      setScoringRules(rules);
      setLastUpdated(updated);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load standings'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    async function init() {
      try {
        const [data, rules, updated] = await Promise.all([
          standingsRepository.getStandings(),
          scoringRepository.getScoringRules(),
          standingsRepository.getLastUpdated(),
        ]);
        if (isMounted) {
          setStandings(data);
          setScoringRules(rules);
          setLastUpdated(updated);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to load standings'));
          setIsLoading(false);
        }
      }
    }

    init();

    // Subscribe to realtime updates if repository supports subscription
    if (standingsRepository.subscribeToStandings) {
      const unsubscribe = standingsRepository.subscribeToStandings((updatedStandings) => {
        if (isMounted) {
          setStandings(updatedStandings);
          setLastUpdated(new Date().toISOString());
        }
      });
      return () => {
        isMounted = false;
        unsubscribe();
      };
    }

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    standings,
    scoringRules,
    lastUpdated,
    isLoading,
    error,
    refresh: fetchStandingsData,
  };
}
