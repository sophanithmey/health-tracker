'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useQueryClient } from '@tanstack/react-query';
import { ModalWrapper } from '@/components/molecules/modal-wrapper';
import { patientService } from '@/services/patient-service';
import { PatientProfile } from '@/types';
import { Stethoscope, CheckCircle2 } from 'lucide-react';

interface EditClinicianModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientProfile;
  onSuccess?: () => void;
}

export function EditClinicianModal({
  isOpen,
  onClose,
  patient,
  onSuccess,
}: EditClinicianModalProps) {
  const t = useTranslations('settings');
  const tCommon = useTranslations('common');
  const queryClient = useQueryClient();

  const [doctorName, setDoctorName] = useState(patient.doctorName || '');
  const [doctorClinic, setDoctorClinic] = useState(patient.doctorClinic || '');
  const [doctorPhone, setDoctorPhone] = useState(patient.doctorPhone || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setDoctorName(patient.doctorName || '');
      setDoctorClinic(patient.doctorClinic || '');
      setDoctorPhone(patient.doctorPhone || '');
      setIsSuccess(false);
    }
  }, [isOpen, patient]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await patientService.updatePatient({
        doctorName: doctorName.trim(),
        doctorClinic: doctorClinic.trim(),
        doctorPhone: doctorPhone.trim(),
      });

      await queryClient.invalidateQueries({ queryKey: ['patient'] });
      await queryClient.refetchQueries({ queryKey: ['patient'] });

      setIsSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 900);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update clinician';
      alert(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={t('attendingClinician')}
      subtitle='Update Mom’s primary attending doctor and hospital information'
      icon={<Stethoscope className='w-5 h-5 text-teal-700' />}
      maxWidth='md'
    >
      {isSuccess ? (
        <div className='p-8 text-center space-y-3 animate-fade-in'>
          <CheckCircle2 className='w-12 h-12 text-emerald-600 mx-auto animate-bounce' />
          <h4 className='text-base font-bold text-slate-900 font-khmer'>
            {t('saveSuccess')}
          </h4>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className='p-6 space-y-4'>
          {/* Doctor Name */}
          <div>
            <label className='block text-xs font-bold text-slate-700 mb-1 font-khmer'>
              {t('doctorName')}
            </label>
            <input
              type='text'
              required
              value={doctorName}
              onChange={(e) => setDoctorName(e.target.value)}
              placeholder='e.g. Dr. Linat Kong'
              className='w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600/30'
            />
          </div>

          {/* Clinic or Hospital */}
          <div>
            <label className='block text-xs font-bold text-slate-700 mb-1 font-khmer'>
              {t('doctorClinic')}
            </label>
            <input
              type='text'
              value={doctorClinic}
              onChange={(e) => setDoctorClinic(e.target.value)}
              placeholder='e.g. Ekip Medical Center'
              className='w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600/30 font-khmer'
            />
          </div>

          {/* Doctor Phone */}
          <div>
            <label className='block text-xs font-bold text-slate-700 mb-1 font-khmer'>
              {t('doctorPhone')}
            </label>
            <input
              type='tel'
              value={doctorPhone}
              onChange={(e) => setDoctorPhone(e.target.value)}
              placeholder='e.g. 012 345 678'
              className='w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600/30 font-khmer'
            />
          </div>

          {/* Action Buttons */}
          <div className='flex items-center justify-end space-x-2 pt-2 border-t border-slate-100'>
            <button
              type='button'
              onClick={onClose}
              className='px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 font-khmer'
            >
              {tCommon('cancel')}
            </button>
            <button
              type='submit'
              disabled={isSubmitting}
              className='px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl text-xs shadow-xs transition disabled:opacity-50 font-khmer'
            >
              {isSubmitting ? tCommon('loading') : t('saveChanges')}
            </button>
          </div>
        </form>
      )}
    </ModalWrapper>
  );
}
