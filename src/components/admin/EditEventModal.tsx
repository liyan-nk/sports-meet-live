import React, { useState, useEffect } from 'react';
import type { SportsEvent } from '../../types/models';
import { eventRepository } from '../../data/repositories';
import { Calendar, X, AlertCircle, Save } from 'lucide-react';

interface EditEventModalProps {
  isOpen: boolean;
  event: SportsEvent | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const EditEventModal: React.FC<EditEventModalProps> = ({
  isOpen,
  event,
  onClose,
  onSuccess,
}) => {
  const [eventName, setEventName] = useState<string>('');
  const [category, setCategory] = useState<string>('Athletics');
  const [status, setStatus] = useState<'upcoming' | 'ongoing' | 'completed' | 'live' | 'archived'>('completed');
  
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (event && isOpen) {
      setEventName(event.name);
      setCategory(event.category || 'Athletics');
      setStatus(event.status || 'completed');
      setErrorMsg(null);
    }
  }, [event, isOpen]);

  if (!isOpen || !event) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventRepository.editEvent) {
      alert('Editing events is only supported in Supabase or mock repository.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);

      await eventRepository.editEvent(event.id, {
        name: eventName.trim(),
        category: category.trim(),
        status,
      });

      onSuccess();
      onClose();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to update event');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-amber-500" />
            <h2 className="font-sports text-xl text-white">EDIT EVENT</h2>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 rounded-lg border border-red-800/60 bg-red-950/40 p-3 text-xs text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Event Name */}
          <div>
            <label className="block text-slate-300 font-semibold uppercase tracking-wider mb-1">
              Event Name
            </label>
            <input
              type="text"
              placeholder="e.g. 100M Men, Football, High Jump"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-white focus:border-amber-500 focus:outline-none"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-slate-300 font-semibold uppercase tracking-wider mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-white focus:border-amber-500 focus:outline-none"
            >
              <option value="Athletics">Athletics (Track & Field)</option>
              <option value="Team Games">Team Games (Football, Basketball, Volleyball)</option>
              <option value="Indoor Games">Indoor Games (Chess, Carrom, Badminton)</option>
              <option value="Special Events">Special Events</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-slate-300 font-semibold uppercase tracking-wider mb-1">
              Event Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-white focus:border-amber-500 focus:outline-none"
            >
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Live / Ongoing</option>
              <option value="live">Live Now</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-5 py-2.5 font-sports text-sm text-slate-950 hover:bg-amber-400 active:scale-98 disabled:opacity-50 transition-all font-bold shadow-lg"
            >
              <Save className="h-4 w-4" />
              <span>{isSubmitting ? 'SAVING...' : 'UPDATE EVENT'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
