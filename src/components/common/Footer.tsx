import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';

interface FooterProps {
  onOpenRules?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenRules }) => {
  return (
    <footer className="mt-12 border-t border-slate-200 bg-white py-8 text-slate-600 mb-16 sm:mb-0">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          
          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-bold tracking-wider text-slate-900">
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
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-100"
              >
                <Info className="h-3.5 w-3.5 text-blue-600" />
                <span>Scoring Rules</span>
              </button>
            )}

            <div className="flex items-center gap-1.5 text-slate-500">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Realtime Verified</span>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
};
