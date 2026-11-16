import React from 'react';
import { useTranslations } from 'next-intl';
import { ShieldAlert, HeartHandshake, Stethoscope } from 'lucide-react';
import { UserRole } from '@/types';

interface HeaderUserControlsProps {
  role: UserRole;
  switchRole: (role: UserRole) => void;
  locale: string;
  onLanguageChange: (locale: 'km' | 'en') => void;
  onOpenEmergency: () => void;
}

export function HeaderUserControls({
  role,
  switchRole,
  locale,
  onLanguageChange,
  onOpenEmergency
}: HeaderUserControlsProps) {
  const t = useTranslations('common');

  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      {/* Emergency Rule 15-15 Protocol */}
      <button
        type="button"
        onClick={onOpenEmergency}
        className="h-8 px-2.5 sm:px-3 rounded-xl bg-rose-50 hover:bg-rose-100/90 text-rose-700 border border-rose-200/90 text-xs font-semibold flex items-center gap-1.5 shadow-2xs active:scale-95 transition-all shrink-0"
        aria-label={t('emergency1515') || 'Rule 15-15 Emergency Protocol'}
        title="Rule 15-15 Hypoglycemia Protocol"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600" />
        </span>
        <ShieldAlert className="w-3.5 h-3.5 text-rose-600 shrink-0" />
        <span className="font-semibold text-xs whitespace-nowrap">
          <span className="hidden sm:inline">Rule </span>15-15
        </span>
      </button>

      {/* Role Switcher (Caregiver vs Clinician) */}
      <div
        className="hidden md:flex items-center h-8 bg-slate-100/90 rounded-xl p-0.5 border border-slate-200/70 text-xs shrink-0"
        role="group"
        aria-label={t('switchRole') || 'User Role'}
      >
        <button
          type="button"
          onClick={() => switchRole('family_admin')}
          className={`h-full flex items-center gap-1 px-2.5 rounded-lg transition-all text-xs ${
            role === 'family_admin'
              ? 'bg-white text-teal-900 font-bold shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 font-medium'
          }`}
          title={t('roleCaregiver') || 'Family Caregiver'}
        >
          <HeartHandshake className="w-3.5 h-3.5 text-teal-700 shrink-0" />
          <span className="font-khmer whitespace-nowrap">{t('caregiverShort') || 'Caregiver'}</span>
        </button>
        <button
          type="button"
          onClick={() => switchRole('clinician')}
          className={`h-full flex items-center gap-1 px-2.5 rounded-lg transition-all text-xs ${
            role === 'clinician'
              ? 'bg-white text-teal-900 font-bold shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 font-medium'
          }`}
          title="Clinician"
        >
          <Stethoscope className="w-3.5 h-3.5 text-teal-700 shrink-0" />
          <span className="font-khmer whitespace-nowrap">{t('clinicianShort') || 'Clinician'}</span>
        </button>
      </div>

      {/* Language Toggle Pill */}
      <div
        className="flex items-center h-8 bg-slate-100/90 rounded-xl p-0.5 border border-slate-200/70 text-xs shrink-0"
        role="group"
        aria-label="Language Selector"
      >
        <button
          type="button"
          onClick={() => onLanguageChange('km')}
          className={`h-full px-2.5 rounded-lg transition-all font-khmer text-[11px] ${
            locale === 'km'
              ? 'bg-white text-teal-900 font-bold shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 font-medium'
          }`}
          aria-pressed={locale === 'km'}
        >
          ខ្មែរ
        </button>
        <button
          type="button"
          onClick={() => onLanguageChange('en')}
          className={`h-full px-2.5 rounded-lg transition-all text-[11px] ${
            locale === 'en'
              ? 'bg-white text-teal-900 font-bold shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 font-medium'
          }`}
          aria-pressed={locale === 'en'}
        >
          EN
        </button>
      </div>
    </div>
  );
}
