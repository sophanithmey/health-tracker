'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { PatientProfile } from '@/types';
import { Pill, AlertCircle, Phone, Stethoscope, HeartHandshake, ShieldCheck } from 'lucide-react';

interface PatientHeaderCardProps {
  patient: PatientProfile;
  onRecordClick?: () => void;
}

export function PatientHeaderCard({ patient, onRecordClick }: PatientHeaderCardProps) {
  const t = useTranslations('patient');
  const tCommon = useTranslations('common');

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-teal-900 via-teal-800 to-emerald-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-teal-950/10 border border-teal-700/50">
      {/* Decorative ambient health lights */}
      <div className="absolute -right-16 -top-16 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute right-1/3 -bottom-16 w-60 h-60 bg-teal-400/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left: Patient Avatar & Key Vitals */}
        <div className="flex items-center space-x-5">
          {/* Avatar with health ring */}
          <div className="relative flex-shrink-0">
            <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-300 p-0.5 shadow-lg">
              <div className="w-full h-full bg-teal-950 rounded-[14px] flex items-center justify-center font-black text-2xl text-teal-200">
                {patient.fullName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
            </div>
            <span className="absolute -bottom-1 -right-1 px-2 py-0.5 bg-emerald-500 text-teal-950 font-black text-[10px] rounded-full uppercase tracking-wider border-2 border-teal-900 shadow-xs">
              Live
            </span>
          </div>

          <div>
            <div className="flex flex-wrap items-baseline gap-2">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-khmer">
                {patient.fullNameKm || patient.fullName}
              </h2>
              <span className="text-sm font-semibold text-teal-200/80">
                ({patient.fullName})
              </span>
            </div>

            <p className="text-xs sm:text-sm text-teal-100/90 font-medium mt-1">
              {t('age')} • {patient.ageGroup} • Timezone: {patient.timezone}
            </p>

            {/* Badges Row */}
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-bold bg-amber-400/20 text-amber-200 border border-amber-400/30 backdrop-blur-xs">
                <AlertCircle className="w-3.5 h-3.5 mr-1.5 text-amber-300" />
                {t('diabetesType')}: {patient.diabetesType.toUpperCase()}
              </span>

              <span className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-bold bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 backdrop-blur-xs">
                <Pill className="w-3.5 h-3.5 mr-1.5 text-emerald-300" />
                {patient.currentMedicationsSummary}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Clinician & Emergency Contact Card */}
        <div className="flex flex-col sm:flex-row lg:flex-col gap-3 justify-end lg:items-end">
          <div className="bg-teal-950/60 backdrop-blur-md rounded-2xl p-4 border border-teal-700/60 sm:min-w-[280px]">
            <div className="flex items-center justify-between text-xs text-teal-300 pb-1.5 border-b border-teal-800/60 mb-2">
              <div className="flex items-center space-x-1.5 font-bold">
                <Stethoscope className="w-3.5 h-3.5 text-teal-400" />
                <span>{t('doctor')}</span>
              </div>
              <span className="text-teal-400 font-semibold">{patient.doctorPhone}</span>
            </div>

            <div className="text-sm font-black text-white">
              {patient.doctorName || 'Dr. Chanthy Keo'}
            </div>
            <div className="text-xs text-teal-200/80 truncate">
              {patient.doctorClinic || 'Phnom Penh Diabetes Clinic'}
            </div>

            <div className="mt-2.5 pt-2 border-t border-teal-800/60 flex items-center justify-between text-xs">
              <span className="text-teal-300 font-semibold flex items-center space-x-1">
                <HeartHandshake className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t('emergencyContact')}:</span>
              </span>
              <span className="font-bold text-emerald-300">
                {patient.emergencyContactName} ({patient.emergencyContactPhone})
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
