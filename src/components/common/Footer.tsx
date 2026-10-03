import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';

interface FooterProps {
  onOpenRules?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenRules }) => {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white py-10 text-slate-700 mb-16 sm:mb-0">
      <div className="mx-auto max-w-4xl px-4 sm:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          
          <div className="text-center sm:text-left space-y-1">
            <div className="text-base font-black tracking-tight text-slate-900">
              SPORTS MEET LIVE 2026
            </div>
            <p className="text-sm font-medium text-slate-500">
              Official College Championship Points Tracking System
            </p>
          </div>

          <div className="flex items-center gap-4 text-sm">
            {onOpenRules && (
              <button
                onClick={onOpenRules}
                className="flex items-center gap-2 rounded-xl border border-slate-300 bg-slate-50 px-4 py-2 font-bold text-slate-800 transition-colors hover:bg-slate-100"
              >
                <Info className="h-4 w-4 text-blue-600" />
                <span>Scoring Rules</span>
              </button>
            )}

            <div className="flex items-center gap-2 font-semibold text-slate-600">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Realtime Verified</span>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
};
