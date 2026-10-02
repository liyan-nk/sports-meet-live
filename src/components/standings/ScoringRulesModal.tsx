import React from 'react';
import type { ScoringRule } from '../../types/models';
import { X, Award, CheckCircle2 } from 'lucide-react';

interface ScoringRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  rules: ScoringRule[];
}

export const ScoringRulesModal: React.FC<ScoringRulesModalProps> = ({ isOpen, onClose, rules }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-500" />
            <h3 className="font-sports text-lg tracking-wide text-white">Scoring Rules Config</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-4 space-y-3">
          <p className="text-xs text-slate-400 leading-relaxed">
            Standings are computed dynamically from event results according to the configurable rules below:
          </p>

          <div className="divide-y divide-slate-800/60 rounded-lg border border-slate-800 bg-slate-950/60">
            {rules.map((rule) => (
              <div key={rule.id} className="flex items-center justify-between p-3.5">
                <div className="flex items-center gap-3">
                  <div className={`flex h-7 w-7 items-center justify-center rounded font-sports text-xs font-bold ${
                    rule.position === 1 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                    rule.position === 2 ? 'bg-slate-400/20 text-slate-300 border border-slate-400/30' :
                    rule.position === 3 ? 'bg-amber-700/20 text-amber-600 border border-amber-700/30' :
                    'bg-slate-800 text-slate-400'
                  }`}>
                    #{rule.position}
                  </div>
                  <span className="text-sm font-medium text-slate-200">
                    {rule.label || `${rule.position}th Place`}
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="font-sports text-base text-white">{rule.points}</span>
                  <span className="text-xs text-slate-400">PTS</span>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-lg bg-slate-950 p-3 text-[11px] text-slate-400 border border-slate-800/80 flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>Dynamic Architecture:</strong> Team rank position is derived from total calculated points. Updating these rules automatically updates overall team standings.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="w-full rounded-lg bg-slate-800 px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-700 transition-colors"
          >
            Got it
          </button>
        </div>

      </div>
    </div>
  );
};
