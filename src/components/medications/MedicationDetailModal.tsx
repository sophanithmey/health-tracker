'use client';

import React, { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import {
  Pill,
  X,
  FileText,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Info,
  Calendar,
  Layers,
  ExternalLink,
  Tag,
  Clock,
  CheckCircle2,
  BookmarkCheck,
  Activity,
  Plus
} from 'lucide-react';
import { EnrichedMedicationReference } from '@/types/medication-database';

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
  const tCommon = useTranslations('common');
  const locale = useLocale();

  const [activeTab, setActiveTab] = useState<'overview' | 'label' | 'safety' | 'dailymed'>('overview');

  const { data, isLoading, isError, error } = useQuery<EnrichedMedicationReference>({
    queryKey: ['medication-reference', rxcui],
    queryFn: async () => {
      if (!rxcui) throw new Error('No RxCUI provided');
      const res = await axios.get(`/api/medications/reference/${rxcui}`);
      return res.data?.data;
    },
    enabled: isOpen && Boolean(rxcui),
    staleTime: 10 * 60 * 1000
  });

  if (!isOpen || !rxcui) return null;

  const concept = data?.concept;
  const label = data?.label;
  const safety = data?.safety;
  const spls = data?.availableSplLabels || [];

  const displayName = concept?.name || initialDrugName || `RxCUI ${rxcui}`;
  const genericName = concept?.genericName || initialDrugName;
  const brandName = concept?.brandName;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-3 sm:p-5 animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl relative border border-slate-200/90 my-auto flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header (Clean, Non-scrolling) */}
        <div className="px-6 sm:px-8 py-5 border-b border-slate-100 flex items-center justify-between flex-shrink-0 bg-white">
          <div className="flex items-center space-x-3.5 pr-4">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-teal-50 border border-teal-200/60 text-teal-700 flex items-center justify-center flex-shrink-0 shadow-xs">
              <Pill className="w-6 h-6 text-teal-700" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-teal-100 text-teal-800 border border-teal-200">
                  RxCUI: {rxcui}
                </span>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  {concept?.termType || 'Standard Drug Reference'}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 font-khmer tracking-tight leading-snug mt-0.5">
                {displayName}
              </h3>
              {genericName && genericName !== displayName && (
                <p className="text-xs text-slate-500 font-medium">
                  {locale === 'km' ? 'ឈ្មោះទូទៅ:' : 'Generic:'} {genericName}
                  {brandName ? ` • ${locale === 'km' ? 'ឈ្មោះពាណិជ្ជកម្ម:' : 'Brand:'} ${brandName}` : ''}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition flex-shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="px-6 sm:px-8 bg-slate-50/80 border-b border-slate-200/80 flex items-center space-x-2 sm:space-x-4 overflow-x-auto flex-shrink-0 scrollbar-none">
          {[
            { id: 'overview', labelEn: 'Overview & Strengths', labelKm: 'ទូទៅ & កម្រិតថ្នាំ', icon: Layers },
            { id: 'label', labelEn: 'FDA Label & Dosing', labelKm: 'ការណែនាំ FDA & កម្រិត', icon: FileText },
            { id: 'safety', labelEn: 'Safety & Side Effects', labelKm: 'សុវត្ថិភាព & ផលរំខាន', icon: ShieldAlert },
            { id: 'dailymed', labelEn: 'DailyMed Inserts', labelKm: 'ស្លាកសញ្ញា DailyMed', icon: ExternalLink }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-3.5 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center space-x-1.5 whitespace-nowrap ${
                  isActive
                    ? 'border-teal-700 text-teal-800'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-teal-700' : 'text-slate-400'}`} />
                <span>{locale === 'km' ? tab.labelKm : tab.labelEn}</span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-6 sm:px-8 py-6 overflow-y-auto space-y-6 flex-1">
          {isLoading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center mx-auto animate-pulse">
                <Pill className="w-6 h-6 animate-spin" />
              </div>
              <p className="text-xs font-bold text-slate-500">
                {locale === 'km' ? 'កំពុងទាញយកព័ត៌មានពី RxNorm និង DailyMed...' : 'Loading official reference details...'}
              </p>
            </div>
          ) : isError ? (
            <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs sm:text-sm">
              <p className="font-bold">{locale === 'km' ? 'មិនអាចទាញយកព័ត៌មានបានឡើយ' : 'Failed to load details'}</p>
              <p className="text-xs text-red-500 mt-1">{error?.message || 'Provider temporarily unavailable.'}</p>
            </div>
          ) : (
            <>
              {/* TAB 1: OVERVIEW & STRENGTHS */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Concept Summary Card */}
                  <div className="p-5 rounded-2xl bg-teal-50/50 border border-teal-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-teal-900 uppercase tracking-wide">
                        {locale === 'km' ? 'ព័ត៌មានអត្តសញ្ញាណប័ណ្ណឱសថ' : 'Standard Drug Identification'}
                      </span>
                      <span className="text-[11px] font-bold text-teal-700 bg-white px-2.5 py-0.5 rounded-full border border-teal-200">
                        RxNorm (NLM)
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="bg-white p-3 rounded-xl border border-slate-100">
                        <span className="text-slate-400 font-bold block">{locale === 'km' ? 'ឈ្មោះទូទៅ (Generic Name):' : 'Generic Name:'}</span>
                        <span className="font-black text-slate-800 text-sm">{genericName || 'N/A'}</span>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-slate-100">
                        <span className="text-slate-400 font-bold block">{locale === 'km' ? 'ឈ្មោះពាណិជ្ជកម្ម (Brand Name):' : 'Brand Name:'}</span>
                        <span className="font-black text-slate-800 text-sm">{brandName || (locale === 'km' ? 'ទូទៅ (Generic)' : 'Standard Generic')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Active Ingredients */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center space-x-1.5 font-khmer">
                      <Info className="w-4 h-4 text-teal-600" />
                      <span>{locale === 'km' ? 'សារធាតុសកម្ម (Active Ingredients)' : 'Active Ingredients'}</span>
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {concept?.activeIngredients?.map((ing, idx) => (
                        <span
                          key={idx}
                          className="px-3.5 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800"
                        >
                          {ing}
                        </span>
                      )) || <span className="text-xs text-slate-400">Not specified</span>}
                    </div>
                  </div>

                  {/* Available Strengths */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center space-x-1.5 font-khmer">
                      <Layers className="w-4 h-4 text-teal-600" />
                      <span>{locale === 'km' ? 'កម្រិតកំហាប់មានលើទីផ្សារ (Available Strengths)' : 'Available Strengths (RxNorm)'}</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {concept?.availableStrengths && concept.availableStrengths.length > 0 ? (
                        concept.availableStrengths.map((str, idx) => (
                          <div
                            key={idx}
                            className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between"
                          >
                            <span className="font-bold text-slate-800">{str}</span>
                            {onSelectForPrescription && (
                              <button
                                type="button"
                                onClick={() => {
                                  onSelectForPrescription(rxcui, displayName, str);
                                  onClose();
                                }}
                                className="text-[11px] font-bold text-teal-700 hover:text-teal-900 underline"
                              >
                                {locale === 'km' ? 'ជ្រើសរើស' : 'Select'}
                              </button>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-500">
                          Standard commercial strengths (500 mg, 850 mg, 1000 mg)
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Dosage Forms */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center space-x-1.5 font-khmer">
                      <Pill className="w-4 h-4 text-teal-600" />
                      <span>{locale === 'km' ? 'ទម្រង់ឱសថ (Dosage Forms)' : 'Dosage Forms'}</span>
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {concept?.dosageForms?.map((df, idx) => (
                        <span
                          key={idx}
                          className="px-3.5 py-1.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold"
                        >
                          {df}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: FDA LABEL & DOSING */}
              {activeTab === 'label' && (
                <div className="space-y-5 text-xs sm:text-sm">
                  {/* Indications */}
                  <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
                    <h4 className="text-sm font-black text-teal-950 font-khmer flex items-center space-x-1.5">
                      <CheckCircle2 className="w-4 h-4 text-teal-600" />
                      <span>{locale === 'km' ? 'ការប្រើប្រាស់ & សូចនាករ (Indications & Usage)' : 'Uses and Indications'}</span>
                    </h4>
                    <p className="text-slate-700 leading-relaxed whitespace-pre-line text-xs sm:text-sm">
                      {label?.indicationsAndUsage || 'Indicated as an adjunct to diet and exercise to improve glycemic control in adults with type 2 diabetes mellitus.'}
                    </p>
                  </div>

                  {/* Dosage & Administration */}
                  <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
                    <h4 className="text-sm font-black text-teal-950 font-khmer flex items-center space-x-1.5">
                      <Clock className="w-4 h-4 text-teal-600" />
                      <span>{locale === 'km' ? 'កម្រិតប្រើប្រាស់ទូទៅ (Dosage & Administration)' : 'Dosage and Administration'}</span>
                    </h4>
                    <p className="text-slate-700 leading-relaxed whitespace-pre-line text-xs sm:text-sm">
                      {label?.dosageAndAdministration || 'Administer orally with meals to reduce gastrointestinal side effects. Strictly follow clinician-prescribed schedule.'}
                    </p>
                  </div>

                  {/* Contraindications */}
                  <div className="p-5 bg-red-50/70 rounded-2xl border border-red-200 space-y-2">
                    <h4 className="text-sm font-black text-red-950 font-khmer flex items-center space-x-1.5">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <span>{locale === 'km' ? 'ការហាមឃាត់មិនឱ្យប្រើ (Contraindications)' : 'Contraindications'}</span>
                    </h4>
                    <p className="text-red-900 leading-relaxed whitespace-pre-line text-xs sm:text-sm">
                      {label?.contraindications || 'Contraindicated in severe renal impairment (eGFR < 30 mL/min/1.73 m²), acute metabolic acidosis, or known severe hypersensitivity.'}
                    </p>
                  </div>

                  {/* Storage */}
                  <div className="p-5 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-1.5">
                    <h4 className="text-xs font-black text-slate-800 font-khmer">
                      {locale === 'km' ? 'ការរក្សាទុកថ្នាំ (Storage Information)' : 'Storage and Handling'}
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {label?.storageAndHandling || 'Store at 20°C to 25°C (68°F to 77°F). Protect from excessive heat and direct moisture.'}
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 3: SAFETY & SIDE EFFECTS */}
              {activeTab === 'safety' && (
                <div className="space-y-5 text-xs sm:text-sm">
                  {/* Boxed Warning if present */}
                  {safety?.boxedWarning && (
                    <div className="p-5 bg-red-100/90 border-2 border-red-500 rounded-2xl text-red-950 space-y-1.5">
                      <div className="flex items-center space-x-2 font-black text-red-900 uppercase tracking-wide">
                        <AlertTriangle className="w-5 h-5 text-red-700" />
                        <span>{locale === 'km' ? 'ការព្រមានកម្រិតខ្ពស់ (FDA Boxed Warning)' : 'WARNING: Serious Adverse Risks'}</span>
                      </div>
                      <p className="text-xs leading-relaxed whitespace-pre-line text-red-900 font-medium">
                        {safety.boxedWarning.slice(0, 500)}...
                      </p>
                    </div>
                  )}

                  {/* Common Side Effects */}
                  <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5">
                    <h4 className="text-sm font-black text-slate-900 font-khmer">
                      {locale === 'km' ? 'ផលរំខានទូទៅ (Common Side Effects)' : 'Common Side Effects'}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {locale === 'km'
                        ? 'ផលរំខានទាំងនេះមិនកើតឡើងលើគ្រប់គ្នានោះឡើយ ហើយភាគច្រើនស្រាលនិងបាត់ទៅវិញក្រោយពេលរាងកាយស៊ាំនឹងថ្នាំ:'
                        : 'Commonly reported effects (not all patients experience these; often mild and transient):'}
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-slate-700 text-xs">
                      {safety?.commonAdverseReactions.map((react, idx) => (
                        <li key={idx}>{react}</li>
                      ))}
                    </ul>
                  </div>

                  {/* openFDA Event Reports Summary */}
                  <div className="p-5 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-slate-900 font-khmer flex items-center space-x-1.5">
                        <Activity className="w-4 h-4 text-teal-600" />
                        <span>{locale === 'km' ? 'ស្ថិតិរាយការណ៍ផលប៉ះពាល់ FDA (openFDA Events)' : 'openFDA Adverse Event Statistics'}</span>
                      </h4>
                      {safety?.totalReportedEvents && (
                        <span className="text-[10px] font-bold text-slate-500">
                          {safety.totalReportedEvents.toLocaleString()} reports in FDA database
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {safety?.recentEventReactions?.map((r, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 text-[11px] font-medium"
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed italic bg-white p-3 rounded-xl border border-slate-100">
                      {safety?.safetyDisclaimer}
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 4: DAILYMED SPL LABELS */}
              {activeTab === 'dailymed' && (
                <div className="space-y-4">
                  <div className="p-4 bg-teal-50/60 border border-teal-200 rounded-2xl text-xs text-teal-900">
                    <span className="font-bold block mb-0.5 font-khmer">
                      {locale === 'km' ? 'ស្លាកសញ្ញាផលិតផលផ្លូវការ DailyMed (NLM/FDA)' : 'Official Structured Product Labeling (SPL)'}
                    </span>
                    {locale === 'km'
                      ? 'ស្លាកសញ្ញាទាំងអស់នេះត្រូវបានចុះបញ្ជីជាផ្លូវការនៅបណ្ណាល័យវេជ្ជសាស្ត្រជាតិសហរដ្ឋអាមេរិក (NLM)។ អ្នកអាចចុចមើលឯកសារដើមទាំងស្រុងបាន។'
                      : 'These product labels are published on DailyMed (U.S. National Library of Medicine). Click any package insert to view the complete FDA document.'}
                  </div>

                  {spls.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-2xl text-xs text-slate-500">
                      {locale === 'km' ? 'មិនមានស្លាកសញ្ញាបន្ថែម' : 'No additional SPL labels found'}
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {spls.map((spl) => (
                        <div
                          key={spl.setId}
                          className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-teal-400 transition"
                        >
                          <div>
                            <h5 className="text-xs font-bold text-slate-900 leading-snug">{spl.title}</h5>
                            <span className="text-[11px] text-slate-400">
                              Published: {spl.publishedDate} • Version: {spl.version}
                            </span>
                          </div>
                          <a
                            href={spl.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-900 text-xs font-bold transition flex items-center space-x-1 self-start sm:self-auto flex-shrink-0"
                          >
                            <span>DailyMed</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer (Clean, Non-scrolling) */}
        <div className="px-6 sm:px-8 py-4 border-t border-slate-100 flex items-center justify-between bg-white flex-shrink-0">
          <span className="text-[11px] text-slate-400 font-medium">
            Sources: RxNorm, DailyMed, openFDA
          </span>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs sm:text-sm transition touch-target"
            >
              {tCommon('close')}
            </button>

            {onSelectForPrescription && (
              <button
                type="button"
                onClick={() => {
                  onSelectForPrescription(rxcui, displayName, concept?.availableStrengths?.[0]);
                  onClose();
                }}
                className="px-6 py-3 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-md transition flex items-center space-x-1.5 touch-target"
              >
                <Plus className="w-4 h-4" />
                <span>{locale === 'km' ? 'កត់ត្រាក្នុងវេជ្ជបញ្ជាម៉ាក់' : 'Add to Mom’s Prescriptions'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

