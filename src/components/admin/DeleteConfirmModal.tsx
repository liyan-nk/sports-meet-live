import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface DetailItem {
  label: string;
  value: string;
}

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  itemDetails?: DetailItem[];
  isDeleting?: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  itemDetails = [],
  isDeleting = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-5 sm:p-6 shadow-xl space-y-4">
        
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          {description}
        </p>

        {itemDetails.length > 0 && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-1.5 text-xs">
            {itemDetails.map((detail, idx) => (
              <div key={idx} className="flex justify-between">
                <span className="font-semibold text-slate-500">{detail.label}:</span>
                <span className="font-bold text-slate-900">{detail.value}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="h-11 rounded-xl bg-red-600 px-5 text-xs font-extrabold text-white hover:bg-red-700 disabled:opacity-50 transition-colors shadow-xs"
          >
            {isDeleting ? 'Deleting...' : 'Delete Permanently'}
          </button>
        </div>

      </div>
    </div>
  );
};
