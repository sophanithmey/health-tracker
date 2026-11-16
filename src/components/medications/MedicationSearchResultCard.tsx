import React from 'react';
import { Pill, Info, Plus } from 'lucide-react';
import { RxNormDrugConcept } from '@/types/medication-database';

interface MedicationSearchResultCardProps {
  item: RxNormDrugConcept;
  onOpenDetail: (rxcui: string, drugName: string) => void;
  onSelectMedication?: (med: RxNormDrugConcept) => void;
}

export function MedicationSearchResultCard({
  item,
  onOpenDetail,
  onSelectMedication
}: MedicationSearchResultCardProps) {
  const generic = item.genericName;
  const brand = item.brandName;

  return (
    <div className="p-4 sm:p-5 rounded-2xl border border-slate-200/80 bg-white hover:border-teal-300 hover:shadow-xs transition flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-start space-x-3.5">
        <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Pill className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
              RxCUI: {item.rxcui}
            </span>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
              {item.tty || 'Standard Drug'}
            </span>
          </div>

          <h4 className="text-sm font-black text-slate-900 mt-1 leading-snug">
            {item.name}
          </h4>

          {generic && generic !== item.name ? (
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Generic: <strong className="text-slate-700">{generic}</strong>
              {brand ? ` • Brand: ${brand}` : ''}
            </p>
          ) : null}

          {item.activeIngredients && item.activeIngredients.length > 0 ? (
            <div className="flex flex-wrap gap-1 mt-2">
              {item.activeIngredients.map((ing, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-semibold"
                >
                  {ing}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex items-center space-x-2 self-end sm:self-center flex-shrink-0">
        <button
          onClick={() => onOpenDetail(item.rxcui, item.name)}
          className="px-3.5 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold transition flex items-center space-x-1 border border-teal-200"
        >
          <Info className="w-3.5 h-3.5" />
          <span>Clinical Details</span>
        </button>

        {onSelectMedication ? (
          <button
            onClick={() => onSelectMedication(item)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
          >
            <Plus className="w-4 h-4" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
