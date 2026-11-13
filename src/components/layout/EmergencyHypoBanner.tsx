'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { AlertTriangle, PhoneCall, X, HeartHandshake, ShieldAlert } from 'lucide-react';

export function EmergencyHypoBanner() {
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations('alerts');
  const tCommon = useTranslations('common');

  return (
    <>
      {/* Sticky top alert trigger banner if needed */}
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-between text-amber-900 text-sm md:text-base">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <span className="font-medium">
            {t('hypo1515Title')}
          </span>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="ml-2 px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-xs md:text-sm font-semibold transition"
        >
          {tCommon('actions')}: 15-15 Rule
        </button>
      </div>

      {/* Emergency Guidance Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl relative border-2 border-red-500 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 p-2 rounded-full hover:bg-gray-100"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex items-center space-x-3 text-red-600 mb-4">
              <AlertTriangle className="w-8 h-8 flex-shrink-0" />
              <h2 className="text-xl md:text-2xl font-bold">
                {t('criticalTitle')}
              </h2>
            </div>

            {/* UNCONSCIOUS PATIENT EMERGENCY WARNING */}
            <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4 mb-5 text-red-900">
              <div className="flex items-start space-x-3">
                <PhoneCall className="w-7 h-7 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-base md:text-lg text-red-800 mb-1">
                    {t('unconsciousWarning')}
                  </h3>
                  <p className="text-sm md:text-base font-medium">
                    Call 119 or emergency services immediately. Turn the patient on their side to maintain an open airway.
                  </p>
                </div>
              </div>
            </div>

            {/* CONSCIOUS PATIENT 15-15 RULE */}
            <div className="bg-teal-50 border border-teal-200 rounded-xl p-5 mb-5 text-teal-950">
              <div className="flex items-center space-x-2 text-teal-800 mb-3">
                <HeartHandshake className="w-6 h-6" />
                <h3 className="font-bold text-lg">
                  {t('hypo1515Title')}
                </h3>
              </div>
              <ul className="space-y-3 text-sm md:text-base">
                <li className="flex items-start space-x-2">
                  <span className="font-bold text-teal-700">1.</span>
                  <span>{t('hypo1515Step1')}</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="font-bold text-teal-700">2.</span>
                  <span>{t('hypo1515Step2')}</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="font-bold text-teal-700">3.</span>
                  <span>{t('hypo1515Step3')}</span>
                </li>
              </ul>
            </div>

            <div className="text-xs text-gray-500 italic mb-4">
              {tCommon('disclaimer')}
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="w-full py-3 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl text-base shadow transition"
            >
              {tCommon('close')}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

