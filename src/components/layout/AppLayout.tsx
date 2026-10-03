import React, { useState } from 'react';
import { Header } from '../common/Header';
import { Footer } from '../common/Footer';
import { MobileBottomNav } from './MobileBottomNav';
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
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white">
      <Header />
      
      {!isOnline && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2 text-center text-xs font-semibold flex items-center justify-center gap-2">
          <WifiOff className="h-4 w-4 text-amber-600 shrink-0" />
          <span>Connection lost. Showing the last available standings.</span>
        </div>
      )}

      <main className="flex-1 pb-16 sm:pb-8">
        <div className="mx-auto max-w-4xl px-4 py-5 sm:px-6 sm:py-8">
          {children}
        </div>
      </main>

      <Footer onOpenRules={() => setIsRulesOpen(true)} />

      <MobileBottomNav />

      <ScoringRulesModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
        rules={scoringRules}
      />
    </div>
  );
};
