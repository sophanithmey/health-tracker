'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useTranslations, useLocale } from 'next-intl';
import { MedicationList } from '@/components/medications/MedicationList';
import { MedicationSearch } from '@/components/medications/MedicationSearch';
import { MedicationDetailModal } from '@/components/medications/MedicationDetailModal';
import { AddMedicationModal } from '@/components/medications/AddMedicationModal';
import { Medication, MedicationLog, RxNormDrugConcept } from '@/types';
import { Pill, Search, ClipboardList, BookOpen, Plus } from 'lucide-react';

export default function MedicationsPage() {
  const t = useTranslations('medications');
  const locale = useLocale();

  const [activeTab, setActiveTab] = useState<'prescriptions' | 'database'>('prescriptions');
  const [detailModalRxcui, setDetailModalRxcui] = useState<string | null>(null);
  const [detailModalDrugName, setDetailModalDrugName] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [prefilledAddData, setPrefilledAddData] = useState<{
    rxcui?: string;
    name?: string;
    dosage?: string;
    genericName?: string;
    brandName?: string;
    activeIngredients?: string[];
    dosageForm?: string;
  } | null>(null);

  const { data: medications, refetch: refetchMeds } = useQuery<Medication[]>({
    queryKey: ['medications'],
    queryFn: async () => {
      const res = await axios.get('/api/medications');
      return res.data?.data || [];
    }
  });

  const { data: logs, refetch: refetchLogs } = useQuery<MedicationLog[]>({
    queryKey: ['medication-logs'],
    queryFn: async () => {
      const res = await axios.get('/api/medications/logs');
      return res.data?.data || [];
    }
  });

  const refresh = () => {
    refetchMeds();
    refetchLogs();
  };

  const handleOpenDetail = (rxcui: string, drugName: string) => {
    setDetailModalRxcui(rxcui);
    setDetailModalDrugName(drugName);
  };

  const handleSelectMedicationForPrescription = (med: RxNormDrugConcept) => {
    setPrefilledAddData({
      rxcui: med.rxcui,
      name: med.name,
      dosage: med.strengths?.[0] || '500 mg',
      genericName: med.genericName,
      brandName: med.brandName,
      activeIngredients: med.activeIngredients,
      dosageForm: med.dosageForms?.[0]
    });
    setIsAddModalOpen(true);
  };

  const handleSelectFromDetail = (rxcui: string, name: string, strength?: string) => {
    setPrefilledAddData({
      rxcui,
      name,
      dosage: strength || '500 mg'
    });
    setIsAddModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Navigation Mode Tabs */}
      <div className="bg-white p-2 sm:p-2.5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center space-x-2">
        <button
          type="button"
          onClick={() => setActiveTab('prescriptions')}
          className={`flex-1 py-3 px-3 sm:px-4 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center justify-center space-x-1.5 sm:space-x-2 touch-target ${
            activeTab === 'prescriptions'
              ? 'bg-teal-700 text-white shadow-sm shadow-teal-700/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <ClipboardList className="w-4 h-4 flex-shrink-0" />
          <span className="font-khmer truncate">
            <span className="sm:hidden">
              {locale === 'km' ? 'បញ្ជីថ្នាំម៉ាក់' : "Mom's Meds"}
            </span>
            <span className="hidden sm:inline">
              {locale === 'km' ? 'បញ្ជីថ្នាំរបស់ម៉ាក់ & កត់ត្រាការលេប' : "Mom's Prescriptions & Dose Logs"}
            </span>
          </span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black flex-shrink-0 ${
            activeTab === 'prescriptions' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
          }`}>
            {medications?.length || 0}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('database')}
          className={`flex-1 py-3 px-3 sm:px-4 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center justify-center space-x-1.5 sm:space-x-2 touch-target ${
            activeTab === 'database'
              ? 'bg-teal-700 text-white shadow-sm shadow-teal-700/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Search className="w-4 h-4 flex-shrink-0" />
          <span className="font-khmer truncate">
            <span className="sm:hidden">
              {locale === 'km' ? 'ស្វែងរកថ្នាំ' : 'Drug Reference'}
            </span>
            <span className="hidden sm:inline">
              {locale === 'km' ? 'មូលទិន្នន័យថ្នាំ & ព័ត៌មានលម្អិត' : 'Drug Database & Reference (RxNorm)'}
            </span>
          </span>
        </button>
      </div>

      {/* Main Tab Views */}
      {activeTab === 'prescriptions' ? (
        <MedicationList
          medications={medications || []}
          logs={logs || []}
          onRefresh={refresh}
          onOpenDetail={handleOpenDetail}
        />
      ) : (
        <MedicationSearch
          onSelectMedication={handleSelectMedicationForPrescription}
          onOpenDetail={handleOpenDetail}
        />
      )}

      {/* Medication Detail Modal */}
      <MedicationDetailModal
        rxcui={detailModalRxcui}
        initialDrugName={detailModalDrugName}
        isOpen={Boolean(detailModalRxcui)}
        onClose={() => setDetailModalRxcui(null)}
        onSelectForPrescription={handleSelectFromDetail}
      />

      {/* Add Medication Modal */}
      <AddMedicationModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setPrefilledAddData(null);
        }}
        onSuccess={refresh}
        initialData={prefilledAddData}
      />
    </div>
  );
}
