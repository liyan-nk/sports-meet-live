import React, { useState } from 'react';
import { useStandings } from '../hooks/useStandings';
import { StandingsHero } from '../components/standings/StandingsHero';
import { StandingsTable } from '../components/standings/StandingsTable';
import { ScoringRulesModal } from '../components/standings/ScoringRulesModal';
import { AlertCircle } from 'lucide-react';

export const StandingsPage: React.FC = () => {
  const { standings, scoringRules, lastUpdated, isLoading, error, refresh } = useStandings();
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refresh();
    setTimeout(() => setIsRefreshing(false), 300);
  };

  if (error) {
    return (
      <div className="rounded-xl border border-red-800/50 bg-red-950/20 p-6 text-center text-red-300">
        <AlertCircle className="mx-auto h-8 w-8 mb-2 text-red-400" />
        <h3 className="font-sports text-lg">Unable to load live standings</h3>
        <p className="text-xs text-red-400 mt-1">{error.message}</p>
        <button
          onClick={handleRefresh}
          className="mt-4 rounded bg-red-900/60 px-4 py-2 text-xs font-semibold text-white hover:bg-red-800"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <StandingsHero
        lastUpdated={lastUpdated}
        onRefresh={handleRefresh}
        onOpenRules={() => setIsRulesModalOpen(true)}
        isRefreshing={isRefreshing}
      />

      {/* Main Standings Table / Cards */}
      {isLoading && standings.length === 0 ? (
        <div className="space-y-4">
          <div className="h-6 w-48 animate-pulse rounded bg-slate-800" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-20 w-full animate-pulse rounded-xl bg-slate-900 border border-slate-800" />
            ))}
          </div>
        </div>
      ) : (
        <StandingsTable standings={standings} onRefresh={handleRefresh} />
      )}

      {/* Modal */}
      <ScoringRulesModal
        isOpen={isRulesModalOpen}
        onClose={() => setIsRulesModalOpen(false)}
        rules={scoringRules}
      />
    </div>
  );
};
