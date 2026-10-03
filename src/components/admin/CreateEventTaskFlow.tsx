import React, { useState, useEffect } from 'react';
import { eventRepository } from '../../data/repositories';
import { Calendar, AlertCircle, CheckCircle, X } from 'lucide-react';

interface CreateEventTaskFlowProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateEventTaskFlow: React.FC<CreateEventTaskFlowProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [eventName, setEventName] = useState<string>('');
  const [category, setCategory] = useState<string>('Track');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setEventName('');
      setCategory('Track');
      setErrorMsg(null);
      setSuccessMsg(null);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

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

      setSuccessMsg('Event created successfully!');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 600);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to create event.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex flex-col bg-slate-50 text-slate-900 overflow-hidden"
    >
      {/* Top Bar Header */}
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-8 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
              Create New Event
            </h2>
          </div>
        </div>
      </header>

      {/* Main Task Form */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-xl mx-auto w-full space-y-6">
        {errorMsg && (
          <div className="flex items-start gap-2.5 rounded-xl border border-red-300 bg-red-50 p-4 text-sm font-bold text-red-900">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-center gap-2.5 rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-sm font-bold text-emerald-950">
            <CheckCircle className="h-5 w-5 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        <form id="create-event-form" onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-800 block">
              Event Title / Name
            </label>
            <input
              type="text"
              placeholder="e.g. 200M Women, High Jump Men, 4x100m Relay"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              className="w-full h-14 rounded-xl border border-slate-300 bg-white px-4 text-base font-bold text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none shadow-xs"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-800 block">
              Event Category
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {['Track', 'Field', 'Indoor', 'Team Sport'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`h-14 rounded-xl border text-sm font-black transition-all ${
                    category === cat
                      ? 'border-blue-600 bg-blue-600 text-white shadow-xs'
                      : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </form>
      </main>

      {/* Sticky Action Footer */}
      <footer className="sticky bottom-0 z-10 border-t border-slate-200 bg-white p-4 sm:px-8 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-lg">
        <div className="max-w-xl mx-auto flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="h-12 px-5 rounded-xl border border-slate-300 bg-white text-sm font-extrabold text-slate-800 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="h-12 px-6 rounded-xl bg-blue-600 text-sm font-extrabold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-xs ml-auto"
          >
            {isSubmitting ? 'Creating...' : 'Save to Event Schedule'}
          </button>
        </div>
      </footer>
    </div>
  );
};
