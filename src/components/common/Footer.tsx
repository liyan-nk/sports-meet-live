import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';

interface FooterProps {
  onOpenRules?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenRules }) => {
  return (
    <footer className="mt-16 border-t border-slate-800 bg-slate-950 py-8 text-slate-400">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          
          <div>
            <div className="flex items-center gap-2 font-sports text-sm tracking-wider text-slate-200">
              <span>SPORTS MEET LIVE 2026</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Official College Championship Points Tracking System
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            {onOpenRules && (
              <button
                onClick={onOpenRules}
                className="flex items-center gap-1.5 rounded border border-slate-800 bg-slate-900 px-3 py-1.5 text-slate-300 transition-colors hover:border-slate-700 hover:bg-slate-800 hover:text-white"
              >
                <Info className="h-3.5 w-3.5 text-amber-400" />
                <span>Scoring Rules</span>
              </button>
            )}

            <div className="flex items-center gap-1.5 text-slate-500">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>Phase 1 Production Build</span>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
};
