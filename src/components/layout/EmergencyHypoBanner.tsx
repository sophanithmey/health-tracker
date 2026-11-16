'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';
import { AlertTriangle, PhoneCall, X, HeartHandshake } from 'lucide-react';

interface EmergencyHypoBannerProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function EmergencyHypoBanner({ isOpen: externalIsOpen, onClose: externalOnClose }: EmergencyHypoBannerProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const t = useTranslations('alerts');
  const tCommon = useTranslations('common');

  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const handleClose = externalOnClose || (() => setInternalIsOpen(false));

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm p-4 sm:p-6 animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop click to close */}
      <div className="fixed inset-0 -z-10" onClick={handleClose} aria-hidden="true" />

      {/* Modal Center Alignment Wrapper */}
      <div className="min-h-full flex items-center justify-center py-6 sm:py-10">
        <div className="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-7 shadow-2xl relative border border-slate-200/90 my-auto animate-scale-in">
          {/* Top Close Button */}
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-4 right-4 sm:top-5 sm:right-5 text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition"
            aria-label={tCommon('close') || 'Close'}
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 text-red-600 mb-4 pr-8">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 font-khmer leading-snug">
                {t('criticalTitle')}
              </h2>
              <p className="text-xs text-slate-500 font-medium">Emergency Guidance &amp; 15-15 Rule</p>
            </div>
          </div>

          {/* UNCONSCIOUS PATIENT EMERGENCY WARNING */}
          <div className="bg-red-50 border border-red-200/90 rounded-2xl p-3.5 sm:p-4 mb-3.5 text-red-950 shadow-xs">
            <div className="flex items-start gap-2.5">
              <PhoneCall className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-xs sm:text-sm text-red-900 mb-1 leading-snug font-khmer">
                  {t('unconsciousWarning')}
                </h3>
                <p className="text-[11px] sm:text-xs text-red-800 font-medium leading-relaxed">
                  Call 119 or emergency hospital services immediately. Position patient on their side to keep the airway open.
                </p>
              </div>
            </div>
          </div>

          {/* CONSCIOUS PATIENT 15-15 RULE */}
          <div className="bg-teal-50/70 border border-teal-200/80 rounded-2xl p-4 sm:p-5 mb-3.5 text-teal-950">
            <div className="flex items-center gap-2 text-teal-900 mb-2.5">
              <HeartHandshake className="w-4 h-4 text-teal-700" />
              <h3 className="font-bold text-xs sm:text-base font-khmer">
                {t('hypo1515Title')}
              </h3>
            </div>
            <ul className="space-y-2 text-xs sm:text-sm font-khmer">
              <li className="flex items-start gap-2">
                <span className="font-black text-teal-700 w-4 shrink-0">1.</span>
                <span className="text-slate-800">{t('hypo1515Step1')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-black text-teal-700 w-4 shrink-0">2.</span>
                <span className="text-slate-800">{t('hypo1515Step2')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-black text-teal-700 w-4 shrink-0">3.</span>
                <span className="text-slate-800">{t('hypo1515Step3')}</span>
              </li>
            </ul>
          </div>

          {/* Disclaimer */}
          <div className="text-[11px] text-slate-500 italic mb-4 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100 font-khmer">
            {tCommon('disclaimer')}
          </div>

          {/* Close Action */}
          <button
            type="button"
            onClick={handleClose}
            className="w-full py-2.5 sm:py-3 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl text-xs sm:text-sm shadow transition font-khmer"
          >
            {tCommon('close')}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
