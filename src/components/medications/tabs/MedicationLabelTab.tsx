import React from 'react';
import { useLocale } from 'next-intl';
import { ShieldAlert, AlertTriangle, FileText, ExternalLink } from 'lucide-react';
import { MedicationClinicalLabel } from '@/types/medication-database';

interface MedicationLabelTabProps {
  label?: MedicationClinicalLabel | null;
}

export function MedicationLabelTab({ label }: MedicationLabelTabProps) {
  const locale = useLocale();

  if (!label) {
    return (
      <div className="py-12 text-center text-slate-400 text-xs">
        No official DailyMed SPL label available for this medication concept.
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in text-xs leading-relaxed">
      {/* Disclaimer */}
      <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl text-[11px] text-amber-900 flex items-start space-x-2">
        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <p>
          Official US FDA DailyMed Labeling. Formulations sold in Cambodia may differ in brand names, excipients, or packaging.
        </p>
      </div>

      {/* Indications */}
      {label.indicationsAndUsage ? (
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
          <h4 className="font-bold text-slate-900 mb-1.5 uppercase tracking-wider text-[11px] flex items-center">
            <FileText className="w-3.5 h-3.5 mr-1.5 text-teal-700" />
            Indications &amp; Clinical Usage
          </h4>
          <p className="text-slate-700 whitespace-pre-line">{label.indicationsAndUsage}</p>
        </div>
      ) : null}

      {/* Dosage & Administration */}
      {label.dosageAndAdministration ? (
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
          <h4 className="font-bold text-slate-900 mb-1.5 uppercase tracking-wider text-[11px]">
            Dosage &amp; Administration
          </h4>
          <p className="text-slate-700 whitespace-pre-line">{label.dosageAndAdministration}</p>
        </div>
      ) : null}

      {/* Warnings & Precautions */}
      {label.warningsAndPrecautions ? (
        <div className="p-4 rounded-2xl bg-red-50/60 border border-red-200">
          <h4 className="font-bold text-red-900 mb-1.5 uppercase tracking-wider text-[11px] flex items-center">
            <ShieldAlert className="w-3.5 h-3.5 mr-1.5 text-red-600" />
            Warnings &amp; Precautions
          </h4>
          <p className="text-red-950 whitespace-pre-line">{label.warningsAndPrecautions}</p>
        </div>
      ) : null}

      {/* Contraindications */}
      {label.contraindications ? (
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
          <h4 className="font-bold text-slate-900 mb-1.5 uppercase tracking-wider text-[11px]">
            Contraindications
          </h4>
          <p className="text-slate-700 whitespace-pre-line">{label.contraindications}</p>
        </div>
      ) : null}

      {/* Source link */}
      {label.sourceUrl ? (
        <div className="pt-2 text-right">
          <a
            href={label.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1 text-teal-700 hover:text-teal-900 font-bold text-xs"
          >
            <span>View full label on DailyMed (NLM)</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      ) : null}
    </div>
  );
}
