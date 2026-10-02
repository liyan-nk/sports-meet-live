import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  title: string;
  description?: string;
  itemDetails: {
    label: string;
    value: string;
  }[];
  isDeleting?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  title,
  description,
  itemDetails,
  isDeleting = false,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl border border-red-900/50 bg-slate-900 p-6 shadow-2xl space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-red-400">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <h2 className="font-sports text-lg text-white uppercase tracking-wider">{title}</h2>
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-xs text-slate-300">
          {description || 'Are you sure you want to delete this entry? Points and standings will be recalculated immediately.'}
        </p>

        {/* Breakdown Card */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3.5 space-y-2 text-xs">
          {itemDetails.map((detail, idx) => (
            <div key={idx} className="flex justify-between items-center border-b border-slate-800/60 pb-1.5 last:border-0 last:pb-0">
              <span className="text-slate-400 font-medium">{detail.label}</span>
              <span className="text-slate-100 font-semibold">{detail.value}</span>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex items-center gap-1.5 rounded-xl bg-red-600 px-5 py-2.5 font-sports text-xs font-bold text-white hover:bg-red-500 active:scale-98 disabled:opacity-50 transition-all shadow-lg"
          >
            <Trash2 className="h-4 w-4" />
            <span>{isDeleting ? 'DELETING...' : 'DELETE ENTRY'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
