import React, { useState, useEffect } from 'react';
import type { SportsEvent } from '../../types/models';
import { eventRepository } from '../../data/repositories';
import { X, Edit2, AlertCircle } from 'lucide-react';

interface EditEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  event: SportsEvent | null;
}

export const EditEventModal: React.FC<EditEventModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  event,
}) => {
  const [eventName, setEventName] = useState<string>('');
  const [category, setCategory] = useState<string>('Track');
  const [status, setStatus] = useState<SportsEvent['status']>('completed');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (event && isOpen) {
      setEventName(event.name);
      setCategory(event.category || 'Track');
      setStatus(event.status || 'completed');
      setErrorMsg(null);
    }
  }, [event, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event || !eventName.trim()) return;

    try {
      setIsSubmitting(true);
      setErrorMsg(null);

      if (eventRepository.editEvent) {
        await eventRepository.editEvent(event.id, {
          name: eventName.trim(),
          category,
          status,
        });
      }

      onSuccess();
      onClose();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to update event');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !event) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xl space-y-4">
        
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Edit2 className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">Edit Event Details</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Event Name
            </label>
            <input
              type="text"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-blue-600 focus:outline-none shadow-xs"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-sm font-semibold text-slate-900 focus:border-blue-600 focus:outline-none shadow-xs"
            >
              <option value="Track">Track</option>
              <option value="Field">Field</option>
              <option value="Indoor">Indoor</option>
              <option value="Team Sport">Team Sport</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Status
            </label>
            <select
              value={status || 'completed'}
              onChange={(e) => setStatus(e.target.value as SportsEvent['status'])}
              className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-sm font-semibold text-slate-900 focus:border-blue-600 focus:outline-none shadow-xs"
            >
              <option value="upcoming">Upcoming</option>
              <option value="in_progress">Live / In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-11 rounded-xl bg-blue-600 px-5 text-xs font-extrabold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-xs"
            >
              {isSubmitting ? 'Saving...' : 'Update Event'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
