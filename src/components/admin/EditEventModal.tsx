import React, { useState, useEffect } from 'react';
import type { SportsEvent } from '../../types/models';
import { eventRepository } from '../../data/repositories';
import { ModalSheet } from '../common/ModalSheet';
import { Edit2, AlertCircle } from 'lucide-react';

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

  const footerActions = (
    <>
      <button
        type="button"
        onClick={onClose}
        className="h-12 rounded-xl border border-slate-300 bg-white px-6 text-sm font-bold text-slate-800 hover:bg-slate-100"
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="h-12 rounded-xl bg-blue-600 px-6 text-sm font-extrabold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-xs"
      >
        {isSubmitting ? 'Saving...' : 'Update Event'}
      </button>
    </>
  );

  return (
    <ModalSheet
      isOpen={isOpen && !!event}
      onClose={onClose}
      title="Edit Event Details"
      icon={<Edit2 className="h-6 w-6 text-blue-600" />}
      footerActions={footerActions}
      maxWidth="max-w-md"
    >
      {errorMsg && (
        <div className="flex items-start gap-2 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-900 font-bold">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label className="block text-sm font-bold text-slate-800">
            Event Name
          </label>
          <input
            type="text"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            className="w-full h-12 rounded-xl border border-slate-300 bg-white px-4 text-base font-medium text-slate-900 focus:border-blue-600 focus:outline-none"
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-bold text-slate-800">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full h-12 rounded-xl border border-slate-300 bg-slate-50 px-4 text-base font-semibold text-slate-900 focus:border-blue-600 focus:outline-none"
          >
            <option value="Track">Track</option>
            <option value="Field">Field</option>
            <option value="Indoor">Indoor</option>
            <option value="Team Sport">Team Sport</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-bold text-slate-800">
            Status
          </label>
          <select
            value={status || 'completed'}
            onChange={(e) => setStatus(e.target.value as SportsEvent['status'])}
            className="w-full h-12 rounded-xl border border-slate-300 bg-slate-50 px-4 text-base font-semibold text-slate-900 focus:border-blue-600 focus:outline-none"
          >
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Live / In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </form>
    </ModalSheet>
  );
};
