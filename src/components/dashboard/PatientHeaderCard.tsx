'use client';

import React, { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { PatientProfile } from '@/types';
import {
  Pill,
  Stethoscope,
  PhoneCall,
  Activity,
  ChevronRight,
  Pencil
} from 'lucide-react';
import { EditClinicianModal } from './EditClinicianModal';

interface PatientHeaderCardProps {
  patient: PatientProfile;
  onRecordClick?: () => void;
  estimatedA1c?: number | null;
}

export function PatientHeaderCard({ patient, estimatedA1c }: PatientHeaderCardProps) {
  const t = useTranslations('patient');
  const locale = useLocale();
  const [isEditClinicianOpen, setIsEditClinicianOpen] = useState(false);

  const diabetesTypeKey =
    patient.diabetesType === 'prediabetes' ? 'prediabetes' :
    patient.diabetesType === 'type_1' ? 'type1' :
    patient.diabetesType === 'type_2' ? 'type2' :
    patient.diabetesType === 'gestational' ? 'gestational' :
    'otherType';

  const initials = (patient.fullName || 'PT')
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'PT';

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm relative">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left: Avatar & Patient Identity */}
        <div className="flex items-start sm:items-center space-x-4 sm:space-x-5">
          {/* Avatar with soft status ring */}
          <div className="relative shrink-0">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-linear-to-br from-teal-700 via-teal-800 to-emerald-900 text-white flex items-center justify-center font-black text-xl sm:text-2xl shadow-sm border border-teal-500/20">
              {initials}
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white shadow-2xs"></span>
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-baseline gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-khmer">
                {patient.fullNameKm || patient.fullName || 'Patient'}
              </h2>
              {patient.fullNameKm && patient.fullName && patient.fullNameKm !== patient.fullName ? (
                <span className="text-xs sm:text-sm font-semibold text-slate-500">
                  ({patient.fullName})
                </span>
              ) : null}
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200/80">
                {locale === 'km' ? 'ម៉ាក់' : "Mom's Profile"}
              </span>
            </div>

            <p className="text-xs text-slate-500 font-medium">
              {locale === 'km' ? 'ក្រុមអាយុ៖ ' : 'Age: '}
              <span className="font-semibold text-slate-700">{patient.ageGroup}</span>
              {' '}•{' '}
              {patient.timezone}
            </p>

            {/* Badges Row */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-bold bg-teal-50 text-teal-900 border border-teal-200/70 shadow-2xs font-khmer">
                <Activity className="w-3.5 h-3.5 mr-1.5 text-teal-700" />
                {t(diabetesTypeKey)}
              </span>

              {estimatedA1c !== null && estimatedA1c !== undefined ? (
                <span className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-900 border border-indigo-200/80 shadow-2xs font-khmer">
                  <span className="mr-1.5 text-xs">🩺</span>
                  <span>{locale === 'km' ? 'HbA1c ប៉ាន់ស្មាន៖ ' : 'eA1c: '}</span>
                  <strong className="ml-1 text-indigo-700">{estimatedA1c.toFixed(1)}%</strong>
                </span>
              ) : null}

              <Link
                href="/medications"
                className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-900 border border-emerald-200/80 hover:bg-emerald-100/70 transition shadow-2xs group"
                title="View Mom's Medication Schedule"
              >
                <Pill className="w-3.5 h-3.5 mr-1.5 text-emerald-700 shrink-0" />
                <span className="truncate max-w-[200px] sm:max-w-[280px]">
                  {patient.currentMedicationsSummary || t('currentMedication')}
                </span>
                <ChevronRight className="w-3 h-3 ml-1 text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        {/* Right: Care Team & Emergency Quick Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 lg:self-center shrink-0">
          {/* Clinician Card (Interactive 1-Tap Edit) */}
          <button
            type="button"
            onClick={() => setIsEditClinicianOpen(true)}
            className="p-3 sm:p-3.5 rounded-2xl bg-slate-50/90 hover:bg-teal-50/50 border border-slate-200/80 hover:border-teal-300 flex items-center space-x-3 text-xs text-left transition shadow-2xs group cursor-pointer"
            title={t('editDoctor')}
          >
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200/80 text-teal-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div className="min-w-0 pr-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider">
                  {t('doctor')}
                </span>
                <span className="flex items-center text-[10px] font-medium text-slate-400 group-hover:text-teal-700 transition">
                  <Pencil className="w-2.5 h-2.5 mr-0.5" />
                  {locale === 'km' ? 'កែ' : 'Edit'}
                </span>
              </div>
              <div className="font-bold text-slate-900 truncate">
                {patient.doctorName || (locale === 'km' ? 'មិនទាន់កំណត់' : 'Not assigned')}
              </div>
              <div className="text-[11px] text-slate-500 truncate flex items-center gap-1.5">
                <span>{patient.doctorClinic || (locale === 'km' ? 'គ្លីនិកមិនទាន់បញ្ជាក់' : 'No clinic specified')}</span>
                {patient.doctorPhone ? (
                  <>
                    <span>•</span>
                    <span className="font-mono text-teal-700 font-semibold">{patient.doctorPhone}</span>
                  </>
                ) : null}
              </div>
            </div>
          </button>

          {/* Emergency 1-Tap Call Button */}
          {patient.emergencyContactPhone ? (
            <a
              href={`tel:${patient.emergencyContactPhone.replace(/\s+/g, '')}`}
              className="p-3 sm:p-3.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100/90 border border-emerald-300 text-emerald-950 flex items-center space-x-3 transition shadow-2xs group touch-target"
              title={`Call ${patient.emergencyContactName}`}
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                <PhoneCall className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                  {locale === 'km' ? 'ទូរស័ព្ទបន្ទាន់' : 'Emergency Contact'}
                </div>
                <div className="font-black text-xs sm:text-sm text-slate-900 truncate">
                  {patient.emergencyContactName} {patient.emergencyContactRelation ? `(${patient.emergencyContactRelation})` : ''}
                </div>
                <div className="text-[11px] font-bold text-emerald-700">
                  {patient.emergencyContactPhone}
                </div>
              </div>
            </a>
          ) : (
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-500">
              <span className="text-[10px] font-bold uppercase tracking-wider block text-slate-400">
                {t('emergencyContact')}
              </span>
              <span>{locale === 'km' ? 'មិនទាន់កំណត់' : 'Not configured'}</span>
            </div>
          )}
        </div>
      </div>

      <EditClinicianModal
        isOpen={isEditClinicianOpen}
        onClose={() => setIsEditClinicianOpen(false)}
        patient={patient}
      />
    </div>
  );
}
