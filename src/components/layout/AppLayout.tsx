import React, { useState } from 'react';
import { Header } from '../common/Header';
import { Footer } from '../common/Footer';
import { ScoringRulesModal } from '../standings/ScoringRulesModal';
import { useStandings } from '../../hooks/useStandings';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const { scoringRules } = useStandings();
  const isOnline = useOnlineStatus();

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-slate-950">
      <Header />
      
      {!isOnline && (
        <div className="bg-amber-950/90 border-b border-amber-600/40 text-amber-200 px-4 py-2 text-center text-xs font-semibold flex items-center justify-center gap-2">
          <WifiOff className="h-4 w-4 text-amber-400 shrink-0" />
          <span>Connection lost. Showing the last available standings.</span>
        </div>
      )}

      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
          {children}
        </div>
      </main>

      <Footer onOpenRules={() => setIsRulesOpen(true)} />

      <ScoringRulesModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
        rules={scoringRules}
      />
    </div>
  );
};
