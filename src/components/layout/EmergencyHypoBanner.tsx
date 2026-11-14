'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { AlertTriangle, PhoneCall, X, HeartHandshake, ShieldAlert } from 'lucide-react';

interface EmergencyHypoBannerProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function EmergencyHypoBanner({ isOpen: externalIsOpen, onClose: externalOnClose }: EmergencyHypoBannerProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const t = useTranslations('alerts');
  const tCommon = useTranslations('common');

  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const handleClose = externalOnClose || (() => setInternalIsOpen(false));

  return (
    <>
      {/* Emergency Guidance Modal (Opened cleanly without ugly sticky bar) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl sm:max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative border border-slate-200 max-h-[90vh] overflow-y-auto">
            <button
              onClick={handleClose}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 text-red-600 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  {t('criticalTitle')}
                </h2>
                <p className="text-xs text-slate-500 font-medium">Emergency Guidance &amp; 15-15 Rule</p>
              </div>
            </div>

            {/* UNCONSCIOUS PATIENT EMERGENCY WARNING */}
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 sm:p-5 mb-5 text-red-950 shadow-xs">
              <div className="flex items-start space-x-3">
                <PhoneCall className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-black text-sm sm:text-base text-red-900 mb-1 leading-snug">
                    {t('unconsciousWarning')}
                  </h3>
                  <p className="text-xs sm:text-sm text-red-800 font-medium mt-1">
                    Call 119 or emergency hospital services immediately. Position patient on their side to keep the airway open.
                  </p>
                </div>
              </div>
            </div>

            {/* CONSCIOUS PATIENT 15-15 RULE */}
            <div className="bg-teal-50/70 border border-teal-200 rounded-2xl p-5 mb-5 text-teal-950">
              <div className="flex items-center space-x-2 text-teal-900 mb-3">
                <HeartHandshake className="w-5 h-5 text-teal-700" />
                <h3 className="font-bold text-sm sm:text-base">
                  {t('hypo1515Title')}
                </h3>
              </div>
              <ul className="space-y-2.5 text-xs sm:text-sm">
                <li className="flex items-start space-x-2.5">
                  <span className="font-black text-teal-700 w-4">1.</span>
                  <span className="text-slate-800">{t('hypo1515Step1')}</span>
                </li>
                <li className="flex items-start space-x-2.5">
                  <span className="font-black text-teal-700 w-4">2.</span>
                  <span className="text-slate-800">{t('hypo1515Step2')}</span>
                </li>
                <li className="flex items-start space-x-2.5">
                  <span className="font-black text-teal-700 w-4">3.</span>
                  <span className="text-slate-800">{t('hypo1515Step3')}</span>
                </li>
              </ul>
            </div>

            <div className="text-[11px] text-slate-500 italic mb-5 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
              {tCommon('disclaimer')}
            </div>

            <button
              onClick={handleClose}
              className="w-full py-3.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-2xl text-sm shadow transition touch-target"
            >
              {tCommon('close')}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
