import React from 'react';
import { ShieldCheck, AlertTriangle } from 'lucide-react';
import { MedicationSafetyInfo } from '@/types/medication-database';

interface MedicationSafetyTabProps {
  safety?: MedicationSafetyInfo | null;
}

export function MedicationSafetyTab({ safety }: MedicationSafetyTabProps) {
  if (!safety) {
    return (
      <div className="py-12 text-center text-slate-400 text-xs">
        No openFDA adverse event data available for this medication.
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in text-xs leading-relaxed">
      {/* FDA Disclaimer */}
      <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-2xl text-[11px] text-blue-900 flex items-start space-x-2">
        <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <p>
          {safety.safetyDisclaimer ||
            'FDA Adverse Event Reporting System (FAERS). Reports do not establish causation.'}
        </p>
      </div>

      {/* Boxed Warning */}
      {safety.boxedWarning ? (
        <div className="p-4 rounded-2xl bg-red-100 border-2 border-red-400 text-red-950 font-medium">
          <h4 className="font-black text-red-900 uppercase tracking-wider text-[11px] mb-1.5 flex items-center">
            <AlertTriangle className="w-4 h-4 mr-1.5 text-red-700" />
            FDA Boxed Warning
          </h4>
          <p className="whitespace-pre-line">{safety.boxedWarning}</p>
        </div>
      ) : null}

      {/* Warnings & Precautions */}
      {safety.warnings && safety.warnings.length > 0 ? (
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
          <h4 className="font-bold text-slate-900 mb-1.5 uppercase tracking-wider text-[11px]">
            Safety Warnings &amp; Precautions
          </h4>
          <ul className="list-disc pl-4 space-y-1 text-slate-700">
            {safety.warnings.map((w: string, idx: number) => (
              <li key={idx}>{w}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* Frequent Reaction Terms */}
      {safety.commonAdverseReactions && safety.commonAdverseReactions.length > 0 ? (
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
          <h4 className="font-bold text-slate-900 mb-2 uppercase tracking-wider text-[11px]">
            Frequently Reported Symptoms in FAERS Database
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {safety.commonAdverseReactions.map((reaction: string, idx: number) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-slate-800 text-[11px] font-semibold"
              >
                {reaction}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
