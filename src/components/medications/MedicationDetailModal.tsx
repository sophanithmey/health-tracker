'use client';

import React, { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { medicationService } from '@/services/medication-service';
import { Pill, X, FileText, ShieldAlert, Layers } from 'lucide-react';
import { EnrichedMedicationReference } from '@/types/medication-database';
import { MedicationOverviewTab } from './tabs/MedicationOverviewTab';
import { MedicationLabelTab } from './tabs/MedicationLabelTab';
import { MedicationSafetyTab } from './tabs/MedicationSafetyTab';

interface MedicationDetailModalProps {
  rxcui: string | null;
  initialDrugName?: string;
  isOpen: boolean;
  onClose: () => void;
  onSelectForPrescription?: (rxcui: string, name: string, strength?: string) => void;
}

export function MedicationDetailModal({
  rxcui,
  initialDrugName,
  isOpen,
  onClose,
  onSelectForPrescription
}: MedicationDetailModalProps) {
  const t = useTranslations('medications');
  const locale = useLocale();
  const [activeTab, setActiveTab] = useState<'overview' | 'label' | 'safety'>('overview');

  const { data, isLoading, isError } = useQuery<EnrichedMedicationReference>({
    queryKey: ['medication-reference', rxcui],
    queryFn: () => medicationService.getReference(rxcui!),
    enabled: isOpen && Boolean(rxcui),
    staleTime: 10 * 60 * 1000
  });

  if (!isOpen || !rxcui) return null;

  const concept = data?.concept;
  const label = data?.label;
  const safety = data?.safety;

  const displayName = concept?.name || initialDrugName || `RxCUI ${rxcui}`;
  const genericName = concept?.genericName || initialDrugName;
  const brandName = concept?.brandName;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl relative border border-slate-200/90 my-auto flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between flex-shrink-0 bg-white">
          <div className="flex items-center space-x-3.5 pr-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200/60 text-teal-700 flex items-center justify-center flex-shrink-0 shadow-xs">
              <Pill className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-teal-100 text-teal-800 border border-teal-200">
                  RxCUI: {rxcui}
                </span>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  {concept?.termType || 'Standard Drug'}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 font-khmer tracking-tight leading-snug mt-0.5">
                {displayName}
              </h3>
              {genericName && genericName !== displayName ? (
                <p className="text-xs text-slate-500 font-medium">
                  Generic: {genericName} {brandName ? ` • Brand: ${brandName}` : ''}
                </p>
              ) : null}
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-3 border-b border-slate-100 flex space-x-4 bg-slate-50/50 flex-shrink-0 overflow-x-auto">
          {[
            { id: 'overview', label: 'Clinical Overview', icon: Layers },
            { id: 'label', label: 'DailyMed FDA Label', icon: FileText },
            { id: 'safety', label: 'openFDA Safety & FAERS', icon: ShieldAlert }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-3 text-xs font-bold transition flex items-center space-x-1.5 border-b-2 whitespace-nowrap ${
                  isActive
                    ? 'border-teal-700 text-teal-900'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {isLoading ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Loading standardized drug monograph...
            </div>
          ) : isError ? (
            <div className="p-4 rounded-2xl bg-red-50 text-red-700 text-xs text-center font-bold">
              Unable to load external drug reference.
            </div>
          ) : activeTab === 'overview' ? (
            <MedicationOverviewTab
              concept={concept}
              rxcui={rxcui}
              onSelectForPrescription={onSelectForPrescription}
            />
          ) : activeTab === 'label' ? (
            <MedicationLabelTab label={label} />
          ) : (
            <MedicationSafetyTab safety={safety} />
          )}
        </div>
      </div>
    </div>
  );
}
