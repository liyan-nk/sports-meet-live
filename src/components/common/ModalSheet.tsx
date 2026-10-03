import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  footerActions?: React.ReactNode;
  maxWidth?: string;
}

export const ModalSheet: React.FC<ModalSheetProps> = ({
  isOpen,
  onClose,
  title,
  icon,
  children,
  footerActions,
  maxWidth = 'max-w-lg',
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-900/60 p-0 sm:p-4 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={`w-full ${maxWidth} rounded-t-3xl sm:rounded-2xl bg-white shadow-2xl flex flex-col max-h-[94vh] sm:max-h-[88vh] overflow-hidden animate-in slide-in-from-bottom duration-200 border border-slate-300`}>
        
        {/* Mobile Pull Handle Indicator */}
        <div className="flex justify-center pt-2.5 pb-1 sm:hidden bg-white shrink-0">
          <div className="h-1.5 w-12 rounded-full bg-slate-300" />
        </div>

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 shrink-0 bg-white">
          <div className="flex items-center gap-2.5">
            {icon}
            <h3 className="text-xl font-black text-slate-900 tracking-tight">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            aria-label="Close dialog"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
          {children}
        </div>

        {/* Modal Sticky Footer Action Bar */}
        {footerActions && (
          <div className="sticky bottom-0 border-t border-slate-200 bg-white p-4 shrink-0 flex items-center justify-end gap-3 z-10 shadow-md">
            {footerActions}
          </div>
        )}
      </div>
    </div>
  );
};
