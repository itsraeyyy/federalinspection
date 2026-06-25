import React from 'react';
import { X, AlertTriangle, Info } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'አረጋግጥ',
  cancelText = 'ተመለስ',
  isDanger = false,
  onConfirm,
  onCancel
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-center items-center p-4">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity animate-in fade-in" 
        onClick={onCancel}
      />
      <div className="relative w-full max-w-sm bg-surface-primary rounded-3xl shadow-2xl flex flex-col animate-in zoom-in-95 duration-200 border border-border overflow-hidden">
        <div className="p-6 text-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isDanger ? 'bg-danger/10 text-danger' : 'bg-brand-blue/10 text-brand-blue'}`}>
            {isDanger ? <AlertTriangle className="w-8 h-8" /> : <Info className="w-8 h-8" />}
          </div>
          <h2 className="text-xl font-heading font-semibold text-text-primary mb-2">
            {title}
          </h2>
          <p className="text-sm text-text-secondary mb-8">
            {message}
          </p>
          <div className="flex gap-3 w-full">
            <button
              onClick={onCancel}
              className="flex-1 bg-surface-secondary text-text-primary px-4 py-2.5 rounded-xl font-medium hover:bg-border transition-colors border border-border"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onCancel();
              }}
              className={`flex-1 text-white px-4 py-2.5 rounded-xl font-medium transition-colors shadow-sm ${
                isDanger ? 'bg-danger hover:bg-danger/90' : 'bg-brand-blue hover:bg-brand-blue/90'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
