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
    <section className="space-y-4 pt-6 border-t border-slate-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Sliders className="h-6 w-6 text-blue-600" />
            <span>SCORING RULES ENGINE</span>
          </h2>
          <p className="text-sm font-semibold text-slate-500">
            Configure placement points per event. Overall standings update automatically.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-900 font-bold">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-950 font-bold">
          <CheckCircle className="h-5 w-5 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {isLoading ? (
        <p className="py-4 text-base text-slate-500">Loading scoring rules...</p>
      ) : (
        <form onSubmit={handleSaveRules} className="space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((pos) => (
              <div key={pos} className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2 text-center">
                <span className="text-sm font-extrabold text-slate-900 block">
                  {pos === 1 ? '🥇 1st Place' : pos === 2 ? '🥈 2nd Place' : pos === 3 ? '🥉 3rd Place' : '4th Place'}
                </span>
                <input
                  type="number"
                  min="0"
                  value={pointsMap[pos] ?? ''}
                  onChange={(e) => handlePointsChange(pos, e.target.value)}
                  className="w-full h-12 rounded-xl border border-slate-300 bg-slate-50 text-center font-mono text-xl font-black text-slate-900 focus:border-blue-600 focus:outline-none"
                  required
                />
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-base font-extrabold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-xs"
          >
            <Save className="h-5 w-5" />
            <span>{isSaving ? 'Saving Rules...' : 'Save Scoring Rules'}</span>
          </button>
        </form>
      )}
    </section>
  );
};
