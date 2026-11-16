import React from 'react';
import { useTranslations } from 'next-intl';
import { Droplet, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { MeasurementType } from '@/types';

interface GlucoseEntryConfirmDialogProps {
  valueMgDl: string;
  measurementType: MeasurementType;
  measuredDate: string;
  measuredTime: string;
  symptoms: string[];
  isSubmitting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function GlucoseEntryConfirmDialog({
  valueMgDl,
  measurementType,
  measuredDate,
  measuredTime,
  symptoms,
  isSubmitting,
  onConfirm,
  onCancel
}: GlucoseEntryConfirmDialogProps) {
  const t = useTranslations('bloodSugar');
  const tCommon = useTranslations('common');
  const val = parseFloat(valueMgDl);

  const isSevereLow = val < 54;
  const isHypo = val < 70;
  const isHyper = val >= 250;

  return (
    <div className="p-6 sm:p-8 animate-fade-in">
      <div className="text-center mb-6">
        <div
          className={`w-16 h-16 rounded-3xl mx-auto flex items-center justify-center mb-3 shadow-md ${
            isSevereLow || isHypo
              ? 'bg-red-50 text-red-600 border border-red-200'
              : isHyper
              ? 'bg-amber-50 text-amber-600 border border-amber-200'
              : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
          }`}
        >
          {isSevereLow || isHypo ? (
            <ShieldAlert className="w-8 h-8" />
          ) : isHyper ? (
            <AlertTriangle className="w-8 h-8" />
          ) : (
            <CheckCircle2 className="w-8 h-8" />
          )}
        </div>

        <h4 className="text-xl font-black text-slate-900 font-khmer">
          {t('confirmReading') || 'Confirm Blood Sugar Reading'}
        </h4>
        <p className="text-xs text-slate-500 mt-1">
          Please verify this entry before saving to Mom&apos;s medical records.
        </p>
      </div>

      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 mb-6 space-y-3 text-sm">
        <div className="flex justify-between items-baseline border-b border-slate-200/60 pb-3">
          <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">
            {t('readingValue')}:
          </span>
          <span className="text-3xl font-black text-slate-900">{val} mg/dL</span>
        </div>

        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-500 font-bold">{t('measurementType')}:</span>
          <span className="font-extrabold text-slate-800 capitalize">
            {measurementType.replace(/_/g, ' ')}
          </span>
        </div>

        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-500 font-bold">Measured At:</span>
          <span className="font-bold text-slate-700">
            {measuredDate} at {measuredTime}
          </span>
        </div>

        {symptoms.length > 0 ? (
          <div className="pt-2 border-t border-slate-200/60 text-xs">
            <span className="text-slate-500 font-bold block mb-1">Reported Symptoms:</span>
            <div className="flex flex-wrap gap-1">
              {symptoms.map((s, i) => (
                <span key={i} className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-[11px] font-medium">
                  {s}
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {isSevereLow ? (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-300 text-red-900 text-xs font-bold mb-6 flex items-start space-x-2.5">
          <ShieldAlert className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span>
            ⚠️ Severe Hypoglycemia warning! An emergency notification will be dispatched immediately.
          </span>
        </div>
      ) : null}

      <div className="flex items-center space-x-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition text-sm"
        >
          {tCommon('cancel') || 'Back'}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isSubmitting}
          className="flex-1 py-3.5 bg-teal-700 hover:bg-teal-800 text-white font-black rounded-2xl transition shadow-md shadow-teal-700/20 text-sm flex items-center justify-center"
        >
          {isSubmitting ? (
            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
          ) : null}
          {tCommon('save') || 'Save Reading'}
        </button>
      </div>
    </div>
  );
}
