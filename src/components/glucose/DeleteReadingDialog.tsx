'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface DeleteReadingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

export function DeleteReadingDialog({
  isOpen,
  onClose,
  onConfirm,
  isDeleting
}: DeleteReadingDialogProps) {
  const t = useTranslations('bloodSugar');
  const tCommon = useTranslations('common');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-3xl max-w-lg sm:max-w-xl w-full p-6 sm:p-8 shadow-2xl relative text-center border border-slate-200">
        <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-7 h-7" />
        </div>

        <h3 className="text-xl font-bold text-slate-900 mb-2">
          {t('deleteTitle')}
        </h3>
        <p className="text-sm text-slate-500 mb-6">
          {t('deleteMessage')}
        </p>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition"
          >
            {tCommon('cancel')}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow transition"
          >
            {isDeleting ? tCommon('loading') : tCommon('delete')}
          </button>
        </div>
      </div>
    </div>
  );
}

