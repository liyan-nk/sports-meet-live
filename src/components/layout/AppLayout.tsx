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
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white">
      <Header />
      
      {!isOnline && (
        <div className="bg-amber-100 border-b border-amber-300 text-amber-950 px-4 py-2.5 text-center text-sm font-bold flex items-center justify-center gap-2">
          <WifiOff className="h-4 w-4 text-amber-800 shrink-0" />
          <span>Connection lost. Showing offline standings snapshot.</span>
        </div>
      )}

      <main className="flex-1 w-full">
        <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-8 sm:py-10 pb-28 sm:pb-16">
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
