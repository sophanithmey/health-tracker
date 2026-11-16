import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl';
}

const maxWidthMap = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '4xl': 'max-w-4xl'
};

export function ModalWrapper({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  children,
  maxWidth = 'lg'
}: ModalWrapperProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-fade-in">
      <div
        className={`bg-white rounded-3xl ${maxWidthMap[maxWidth]} w-full shadow-2xl relative border border-slate-200/90 my-auto overflow-hidden`}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center space-x-3.5 pr-4">
            {icon ? (
              <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200/60 text-teal-700 flex items-center justify-center flex-shrink-0 shadow-xs">
                {icon}
              </div>
            ) : null}
            <div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight leading-snug">
                {title}
              </h3>
              {subtitle ? (
                <p className="text-xs text-slate-500 font-medium mt-0.5">{subtitle}</p>
              ) : null}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {children}
      </div>
    </div>
  );
}
