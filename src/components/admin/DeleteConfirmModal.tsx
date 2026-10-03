import React from 'react';
import { ModalSheet } from '../common/ModalSheet';
import { AlertTriangle } from 'lucide-react';

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
        onClick={onConfirm}
        disabled={isDeleting}
        className="h-12 rounded-xl bg-red-600 px-6 text-sm font-extrabold text-white hover:bg-red-700 disabled:opacity-50 transition-colors shadow-xs"
      >
        {isDeleting ? 'Deleting...' : 'Delete Permanently'}
      </button>
    </>
  );

  return (
    <ModalSheet
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      icon={<AlertTriangle className="h-6 w-6 text-red-600" />}
      footerActions={footerActions}
      maxWidth="max-w-md"
    >
      <p className="text-sm font-medium text-slate-700 leading-relaxed">
        {description}
      </p>

      {itemDetails.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2 text-sm font-medium">
          {itemDetails.map((detail, idx) => (
            <div key={idx} className="flex justify-between">
              <span className="font-semibold text-slate-500">{detail.label}:</span>
              <span className="font-extrabold text-slate-900">{detail.value}</span>
            </div>
          ))}
        </div>
      )}
    </ModalSheet>
  );
};
