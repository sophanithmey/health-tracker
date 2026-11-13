'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { PatientProfile } from '@/types';
import { Pill, AlertCircle, Stethoscope, HeartHandshake, PhoneCall } from 'lucide-react';

interface PatientHeaderCardProps {
  patient: PatientProfile;
  onRecordClick?: () => void;
}

export function PatientHeaderCard({ patient }: PatientHeaderCardProps) {
  const t = useTranslations('patient');

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm relative">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left: Avatar & Patient Identity */}
        <div className="flex items-center space-x-4 sm:space-x-5">
          {/* Avatar with soft status ring */}
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-teal-50 border-2 border-teal-600/30 flex items-center justify-center font-black text-xl sm:text-2xl text-teal-800 shadow-xs">
              {patient.fullName
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white"></span>
            </span>
          </div>

          <div>
            <div className="flex flex-wrap items-baseline gap-2">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-khmer">
                {patient.fullNameKm || patient.fullName}
              </h2>
              <span className="text-sm font-semibold text-slate-500">
                ({patient.fullName})
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              {t('age')} • {patient.ageGroup} • Timezone: {patient.timezone}
            </p>

            {/* Badges Row */}
            <div className="flex flex-wrap items-center gap-2 mt-2.5">
              <span className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200">
                <AlertCircle className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
                {t('diabetesType')}: {patient.diabetesType.toUpperCase()}
              </span>

              <span className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-900 border border-emerald-200">
                <Pill className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                {patient.currentMedicationsSummary}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Clinician & Family Contact Pill */}
        <div className="flex flex-col sm:flex-row lg:flex-col gap-2 justify-end lg:items-end">
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 sm:min-w-[270px]">
            <div className="flex items-center justify-between text-xs text-slate-500 pb-1.5 border-b border-slate-200 mb-1.5">
              <span className="flex items-center space-x-1 font-bold text-teal-800">
                <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                <span>{t('doctor')}</span>
              </span>
              <span className="font-semibold text-slate-700">{patient.doctorPhone}</span>
            </div>

            <div className="text-sm font-black text-slate-900">
              {patient.doctorName || 'Dr. Chanthy Keo'}
            </div>
            <div className="text-xs text-slate-500 truncate">
              {patient.doctorClinic || 'Phnom Penh Diabetes Clinic'}
            </div>

            <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium flex items-center space-x-1">
                <HeartHandshake className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t('emergencyContact')}:</span>
              </span>
              <span className="font-bold text-slate-800">
                {patient.emergencyContactName} ({patient.emergencyContactPhone})
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
