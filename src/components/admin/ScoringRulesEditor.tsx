import React, { useState, useEffect, useCallback } from 'react';
import type { ScoringRule } from '../../types/models';
import { scoringRepository } from '../../data/repositories';
import { Sliders, Save, AlertCircle, CheckCircle } from 'lucide-react';

interface ScoringRulesEditorProps {
  onRulesUpdated?: () => void;
}

export const ScoringRulesEditor: React.FC<ScoringRulesEditorProps> = ({ onRulesUpdated }) => {
  const [rules, setRules] = useState<ScoringRule[]>([]);
  const [pointsMap, setPointsMap] = useState<Record<number, number>>({ 1: 10, 2: 5, 3: 3, 4: 0 });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadRules = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await scoringRepository.getScoringRules();
      setRules(data);
      const map: Record<number, number> = {};
      data.forEach(r => { map[r.position] = r.points; });
      setPointsMap(map);
    } catch (err) {
      console.error('Failed to load scoring rules:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRules();
  }, [loadRules]);

  const handlePointsChange = (position: number, val: string) => {
    const num = parseInt(val, 10);
    setPointsMap(prev => ({ ...prev, [position]: isNaN(num) ? 0 : num }));
  };

  const handleSaveRules = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      if (scoringRepository.updateScoringRules) {
        const updatedRules: ScoringRule[] = rules.map((r) => ({
          ...r,
          points: pointsMap[r.position] ?? r.points,
        }));
        await scoringRepository.updateScoringRules(updatedRules);
      }

      setSuccessMsg('Scoring rules updated successfully!');
      if (onRulesUpdated) onRulesUpdated();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to update scoring rules');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Sliders className="h-4 w-4 text-blue-600" />
            <span>Scoring Rules Engine</span>
          </h3>
          <p className="text-xs text-slate-500">
            Configure placement points per event. Standings update automatically.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
          <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {isLoading ? (
        <div className="p-4 text-center text-xs text-slate-500">Loading scoring rules...</div>
      ) : (
        <form onSubmit={handleSaveRules} className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {[1, 2, 3, 4].map((pos) => (
              <div key={pos} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 space-y-1">
                <span className="font-bold text-slate-900 block">
                  {pos === 1 ? '🥇 1st Place' : pos === 2 ? '🥈 2nd Place' : pos === 3 ? '🥉 3rd Place' : '4th Place'}
                </span>
                <input
                  type="number"
                  min="0"
                  value={pointsMap[pos] ?? ''}
                  onChange={(e) => handlePointsChange(pos, e.target.value)}
                  className="w-full h-10 rounded-lg border border-slate-200 bg-white px-2.5 text-sm font-black font-mono text-slate-900 text-center focus:border-blue-600 focus:outline-none shadow-xs"
                  required
                />
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-extrabold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-xs"
          >
            <Save className="h-4 w-4" />
            <span>{isSaving ? 'Saving Rules...' : 'Save Scoring Rules'}</span>
          </button>
        </form>
      )}
    </div>
  );
};
