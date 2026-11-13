'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { PatientProfile } from '@/types';
import { Pill, AlertCircle, Clock, HeartHandshake } from 'lucide-react';

interface PatientHeaderCardProps {
  patient: PatientProfile;
}

export function PatientHeaderCard({ patient }: PatientHeaderCardProps) {
  const t = useTranslations('patient');

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs relative overflow-hidden">
      {/* Background soft teal glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50 rounded-full blur-3xl -z-10 opacity-70" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Profile Details */}
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-teal-700 text-white font-extrabold flex items-center justify-center text-xl sm:text-2xl shadow-md border-2 border-white ring-2 ring-teal-100 flex-shrink-0">
            {patient.fullName
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2)
              .toUpperCase()}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                {patient.fullNameKm || patient.fullName}
              </h2>
              <span className="text-sm font-semibold text-slate-500">
                ({patient.fullName})
              </span>
            </div>
            <p className="text-sm text-slate-600 font-medium">
              {t('age')} • {patient.ageGroup}
            </p>

            <div className="flex flex-wrap items-center gap-2 mt-2">
              {/* Configurable Diabetes Type Badge */}
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200">
                <AlertCircle className="w-3.5 h-3.5 mr-1 text-amber-600" />
                {t('diabetesType')}: {patient.diabetesType.toUpperCase()}
              </span>

              {/* Medication Status */}
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <Pill className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                {patient.currentMedicationsSummary}
              </span>
            </div>
          </div>
        </div>

        {/* Doctor & Emergency Info (Senior Care Assistance) */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 sm:text-right min-w-[210px]">
          <div className="text-xs text-slate-500 font-medium">
            {t('doctor')}
          </div>
          <div className="text-sm font-bold text-slate-800">
            {patient.doctorName || 'Dr. Chanthy Keo'}
          </div>
          <div className="text-xs text-slate-500 truncate">
            {patient.doctorClinic || 'Phnom Penh Clinic'}
          </div>
          <div className="mt-1 pt-1 border-t border-slate-200 text-xs font-semibold text-teal-700 flex items-center sm:justify-end space-x-1">
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>Emergency: {patient.emergencyContactName}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

