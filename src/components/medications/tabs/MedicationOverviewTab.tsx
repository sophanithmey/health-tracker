import React from 'react';
import { useLocale } from 'next-intl';
import { Tag, Layers, Plus } from 'lucide-react';
import { RxNormDrugDetail } from '@/types/medication-database';

interface MedicationOverviewTabProps {
  concept?: RxNormDrugDetail;
  rxcui: string;
  onSelectForPrescription?: (rxcui: string, name: string, strength?: string) => void;
}

export function MedicationOverviewTab({
  concept,
  rxcui,
  onSelectForPrescription
}: MedicationOverviewTabProps) {
  const locale = useLocale();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Active Ingredients & Strengths */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
          <span className="text-xs font-bold text-slate-500 flex items-center mb-2">
            <Tag className="w-3.5 h-3.5 mr-1.5 text-teal-700" />
            {locale === 'km' ? 'សារធាតុសកម្ម (Active Ingredients)' : 'Active Ingredients'}
          </span>
          {concept?.activeIngredients && concept.activeIngredients.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {concept.activeIngredients.map((ing: string, i: number) => (
                <span key={i} className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs font-bold">
                  {ing}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">Ingredient details not indexed</p>
          )}
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
          <span className="text-xs font-bold text-slate-500 flex items-center mb-2">
            <Layers className="w-3.5 h-3.5 mr-1.5 text-teal-700" />
            {locale === 'km' ? 'ទម្រង់ថ្នាំ & កម្រិត (Form & Strength)' : 'Dosage Form & Strength'}
          </span>
          <p className="text-sm font-bold text-slate-900">
            {concept?.dosageForms?.[0] || 'Oral Tablet / Capsule'}
          </p>
          {concept?.availableStrengths?.[0] ? (
            <p className="text-xs text-slate-500 mt-0.5">Strength: {concept.availableStrengths[0]}</p>
          ) : null}
        </div>
      </div>

      {/* Available Strengths Pills */}
      {concept?.availableStrengths && concept.availableStrengths.length > 0 ? (
        <div className="p-4 rounded-2xl bg-teal-50/40 border border-teal-100">
          <span className="text-xs font-bold text-teal-900 block mb-2">
            Available Clinical Strengths (RxNorm Concept Group)
          </span>
          <div className="flex flex-wrap gap-2">
            {concept.availableStrengths.map((st: string, i: number) => (
              <span key={i} className="px-3 py-1 rounded-xl bg-white border border-teal-200 text-teal-900 text-xs font-bold shadow-2xs">
                {st}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {/* Prescribe / Add to Patient Meds CTA */}
      {onSelectForPrescription ? (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-black text-slate-900">
              {locale === 'km' ? 'បន្ថែមទៅក្នុងកាលវិភាគថ្នាំរបស់ម៉ាក់?' : "Add to Mom's Daily Schedule?"}
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Prefill prescription dialog with standardized RxNorm concept data
            </p>
          </div>
          <button
            onClick={() =>
              onSelectForPrescription(
                rxcui,
                concept?.name || `RxCUI ${rxcui}`,
                concept?.availableStrengths?.[0]
              )
            }
            className="px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center space-x-1.5 flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{locale === 'km' ? 'កត់ត្រាថ្នាំនេះ' : 'Add to Medications'}</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}
