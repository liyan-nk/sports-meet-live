import React from 'react';
import type { ScoringRule } from '../../types/models';
import { ModalSheet } from '../common/ModalSheet';
import { Award, Info } from 'lucide-react';

interface ScoringRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  rules: ScoringRule[];
}

export const ScoringRulesModal: React.FC<ScoringRulesModalProps> = ({
  isOpen,
  onClose,
  rules,
}) => {
  const displayRules = rules.length > 0 ? rules : [
    { position: 1, points: 10, label: '1st Place' },
    { position: 2, points: 5, label: '2nd Place' },
    { position: 3, points: 3, label: '3rd Place' },
    { position: 4, points: 0, label: '4th Place' },
  ];

  const footerActions = (
    <button
      type="button"
      onClick={onClose}
      className="h-12 rounded-xl bg-blue-600 px-6 text-sm font-extrabold text-white hover:bg-blue-700 transition-colors shadow-xs"
    >
      Got It
    </button>
  );

  return (
    <ModalSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Scoring Policy"
      icon={<Award className="h-6 w-6 text-blue-600" />}
      footerActions={footerActions}
      maxWidth="max-w-md"
    >
      <div className="divide-y divide-slate-200 border-t border-b border-slate-200">
        {displayRules.map((rule) => (
          <div
            key={rule.position}
            className="flex items-center justify-between py-3.5 px-2"
          >
            <span className="text-base font-extrabold text-slate-900">
              {rule.position === 1 ? '🥇 1st Place' : rule.position === 2 ? '🥈 2nd Place' : rule.position === 3 ? '🥉 3rd Place' : '4th Place'}
            </span>
            <span className="font-mono text-xl font-black text-blue-600 tabular-nums">
              +{rule.points} <span className="text-xs font-bold text-slate-500">PTS</span>
            </span>
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 text-sm text-blue-950 space-y-1">
        <div className="flex items-center gap-2 font-black text-blue-950">
          <Info className="h-4 w-4 text-blue-600 shrink-0" />
          <span>Official Scoring Rules</span>
        </div>
        <p className="font-medium text-slate-700">
          Points are automatically awarded upon event result recording and added directly to overall team totals in real time.
        </p>
      </div>
    </ModalSheet>
  );
};
