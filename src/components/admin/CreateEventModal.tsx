import React, { useState } from 'react';
import { eventRepository } from '../../data/repositories';
import { ModalSheet } from '../common/ModalSheet';
import { Calendar, AlertCircle } from 'lucide-react';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [eventName, setEventName] = useState<string>('');
  const [category, setCategory] = useState<string>('Track');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventName.trim()) {
      setErrorMsg('Event name is required.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);

      if (eventRepository.createEvent) {
        await eventRepository.createEvent({
          name: eventName.trim(),
          category,
          status: 'completed',
        });
      }

      setEventName('');
      onSuccess();
      onClose();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to create event');
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
        {isSubmitting ? 'Creating...' : 'Create Event'}
      </button>
    </>
  );

  return (
    <ModalSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Event"
      icon={<Calendar className="h-6 w-6 text-blue-600" />}
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
            placeholder="e.g. 100M Men, High Jump Women"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            className="w-full h-12 rounded-xl border border-slate-300 bg-white px-4 text-base font-medium text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none"
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
      </form>
    </ModalSheet>
  );
};
