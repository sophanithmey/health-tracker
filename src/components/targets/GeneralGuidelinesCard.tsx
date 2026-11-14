'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { BookOpen, ShieldAlert, ExternalLink } from 'lucide-react';
import { GeneralGuidelineReference } from '@/types';

interface GeneralGuidelinesCardProps {
  guidelines: GeneralGuidelineReference[];
}

export function GeneralGuidelinesCard({ guidelines }: GeneralGuidelinesCardProps) {
  const t = useTranslations('targets');
  const tCommon = useTranslations('common');

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900">
              {t('adaGuidelinesTitle')}
            </h3>
            <p className="text-xs text-slate-500">
              ADA Standards of Care in Diabetes (2026)
            </p>
          </div>
        </div>
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200/60">
          {t('educationalReference')}
        </span>
      </div>

      {/* Medical Safety Notice */}
      <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl flex items-start space-x-3 text-amber-950 text-xs leading-relaxed">
        <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <strong className="block text-amber-900 font-bold mb-0.5">
            {t('guidelineDisclaimerTitle')}
          </strong>
          {t('guidelineDisclaimer')}
        </div>
      </div>

      {/* Guidelines Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-100">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
            <tr>
              <th className="px-4 py-3">{t('measurement')}</th>
              <th className="px-4 py-3">{t('generalReference')}</th>
              <th className="px-4 py-3">{t('clinicalContext')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {guidelines.map((g) => (
              <tr key={g.measurementType} className="hover:bg-slate-50/60 transition">
                <td className="px-4 py-3 font-bold text-slate-900 whitespace-nowrap">
                  {g.labelEn}
                </td>
                <td className="px-4 py-3 font-black text-teal-800 whitespace-nowrap">
                  {g.minMgDl && g.maxMgDl
                    ? `${g.minMgDl} – ${g.maxMgDl} mg/dL`
                    : g.maxMgDl
                    ? `< ${g.maxMgDl} mg/dL`
                    : `≥ ${g.minMgDl} mg/dL`}
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {g.notesEn}
                </td>
              </tr>
            ))}
            <tr className="hover:bg-slate-50/60 transition bg-slate-50/30">
              <td className="px-4 py-3 font-bold text-slate-900 whitespace-nowrap">
                HbA1c (Glycated Hemoglobin)
              </td>
              <td className="px-4 py-3 font-black text-teal-800 whitespace-nowrap">
                &lt; 7.0% (&lt; 53 mmol/mol)
              </td>
              <td className="px-4 py-3 text-slate-500">
                General nonpregnant adult glycemic goal. Individual targets may be more or less stringent.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
        <span>Source: American Diabetes Association (ADA) Standards of Care</span>
        <a
          href="https://diabetesjournals.org/care/issue/49/Supplement_1"
          target="_blank"
          rel="noopener noreferrer"
          className="text-teal-700 hover:text-teal-800 font-bold inline-flex items-center space-x-1"
        >
          <span>ADA Guidelines</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}

