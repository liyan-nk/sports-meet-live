import React, { useState, useEffect, useCallback } from 'react';
import type { ScoringRule } from '../../types/models';
import { scoringRepository } from '../../data/repositories';
import { Settings, Save, CheckCircle2, AlertCircle, Info } from 'lucide-react';

interface ScoringRulesEditorProps {
  onRulesUpdated: () => void;
}

export const ScoringRulesEditor: React.FC<ScoringRulesEditorProps> = ({ onRulesUpdated }) => {
  const [rules, setRules] = useState<ScoringRule[]>([]);
  const [editedPoints, setEditedPoints] = useState<Record<number, number>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadRules = useCallback(async () => {
    try {
      setIsLoading(true);
      const ruleList = await scoringRepository.getScoringRules();
      setRules(ruleList);
      const initialMap: Record<number, number> = {};
      ruleList.forEach(r => {
        initialMap[r.position] = r.points;
      });
      setEditedPoints(initialMap);
    } catch (err) {
      setStatusMsg({ type: 'error', text: err instanceof Error ? err.message : 'Failed to load rules' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRules();
  }, [loadRules]);

  const handlePointChange = (position: number, value: string) => {
    const parsed = parseInt(value, 10);
    setEditedPoints(prev => ({
      ...prev,
      [position]: isNaN(parsed) ? 0 : Math.max(0, parsed),
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scoringRepository.updateScoringRules) {
      setStatusMsg({ type: 'error', text: 'Rule editing is not supported by current repository.' });
      return;
    }

    try {
      setIsSaving(true);
      setStatusMsg(null);

      const updatedRules: ScoringRule[] = rules.map(r => ({
        ...r,
        points: editedPoints[r.position] ?? r.points,
      }));

      await scoringRepository.updateScoringRules(updatedRules);
      setRules(updatedRules);
      setStatusMsg({ type: 'success', text: 'Scoring rules updated successfully!' });
      onRulesUpdated();
    } catch (err) {
      setStatusMsg({ type: 'error', text: err instanceof Error ? err.message : 'Failed to update rules' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="h-32 animate-pulse rounded-xl bg-slate-900 border border-slate-800" />;
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Settings className="h-4 w-4 text-amber-400" />
          <h3 className="font-sports text-lg tracking-wide text-white">CONFIGURABLE SCORING RULES</h3>
        </div>
        <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-500/20">
          Admin Rule Config
        </span>
      </div>

      <p className="text-xs text-slate-400">
        Update points awarded per placement position. Modifying rules applies to overall team total calculations.
      </p>

      {statusMsg && (
        <div className={`flex items-center gap-2 rounded-lg p-3 text-xs ${
          statusMsg.type === 'success' 
            ? 'border border-emerald-800/60 bg-emerald-950/40 text-emerald-300' 
            : 'border border-red-800/60 bg-red-950/40 text-red-300'
        }`}>
          {statusMsg.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Form Grid */}
      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {rules.map((rule) => (
            <div key={rule.id} className="rounded-lg border border-slate-800 bg-slate-950 p-3 space-y-1.5">
              <label className="block text-[11px] font-semibold text-slate-300">
                {rule.label || `#${rule.position} Place`}
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={editedPoints[rule.position] ?? rule.points}
                  onChange={(e) => handlePointChange(rule.position, e.target.value)}
                  className="w-full rounded border border-slate-700 bg-slate-900 px-2.5 py-1.5 font-sports text-base text-white focus:border-amber-500 focus:outline-none tabular-nums"
                />
                <span className="text-xs text-slate-400 font-bold">PTS</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1 text-[11px] text-slate-500">
            <Info className="h-3.5 w-3.5 text-slate-400" />
            <span>Requires explicit save to commit changes</span>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 disabled:opacity-50 transition-colors"
          >
            <Save className="h-4 w-4" />
            <span>{isSaving ? 'Saving Rules...' : 'Save Rules'}</span>
          </button>
        </div>
      </form>

    </div>
  );
};
