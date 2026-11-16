import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import {
  X,
  ChevronRight,
  PhoneCall,
  ShieldAlert,
  HeartHandshake,
  Stethoscope,
  Ambulance,
  User,
  LucideIcon
} from 'lucide-react';
import { PatientProfile, UserRole } from '@/types';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface HeaderMobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  patient?: PatientProfile;
  patientDisplayName: string;
  role: UserRole;
  switchRole: (role: UserRole) => void;
  navItems: NavItem[];
  pathname: string;
  locale: string;
  onLanguageChange: (locale: 'km' | 'en') => void;
  onOpenEmergency: () => void;
}

export function HeaderMobileDrawer({
  isOpen,
  onClose,
  patient,
  patientDisplayName,
  role,
  switchRole,
  navItems,
  pathname,
  locale,
  onLanguageChange,
  onOpenEmergency
}: HeaderMobileDrawerProps) {
  const t = useTranslations('common');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-200" onClick={onClose} aria-hidden="true" />
      <div className="fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-2xl overflow-y-auto z-10 flex flex-col justify-between border-l border-slate-200 animate-slide-in-right">
        <div className="p-5">
          {/* Header & Patient Info */}
          <div className="flex items-start justify-between pb-3.5 border-b border-slate-100 mb-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                <User className="w-4 h-4 text-teal-700" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm font-khmer leading-tight">{patientDisplayName || 'Mom'}</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">{patient?.ageGroup || '60-69'}</span>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-teal-50 text-teal-800 border border-teal-200/60">{patient?.diabetesType || 'Type 2'}</span>
                </div>
              </div>
            </div>
            <button type="button" onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition" aria-label={t('close') || 'Close menu'}>
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Role & Language Controls */}
          <div className="space-y-2 pb-3.5 mb-3.5 border-b border-slate-100">
            <div className="flex items-center h-8 bg-slate-100 rounded-full p-0.5 border border-slate-200/60 text-xs">
              <button type="button" onClick={() => switchRole('family_admin')} className={`h-full flex-1 flex items-center justify-center gap-1.5 rounded-full transition-all ${role === 'family_admin' ? 'bg-white text-teal-900 font-bold shadow-2xs' : 'text-slate-600 font-medium'}`}>
                <HeartHandshake className="w-3.5 h-3.5 text-teal-700" />
                <span className="font-khmer">{t('caregiverShort') || 'Caregiver'}</span>
              </button>
              <button type="button" onClick={() => switchRole('clinician')} className={`h-full flex-1 flex items-center justify-center gap-1.5 rounded-full transition-all ${role === 'clinician' ? 'bg-white text-teal-900 font-bold shadow-2xs' : 'text-slate-600 font-medium'}`}>
                <Stethoscope className="w-3.5 h-3.5 text-teal-700" />
                <span className="font-khmer">{t('clinicianShort') || 'Clinician'}</span>
              </button>
            </div>
            <div className="flex items-center h-8 bg-slate-100 rounded-full p-0.5 border border-slate-200/60 text-xs">
              <button type="button" onClick={() => onLanguageChange('km')} className={`h-full flex-1 rounded-full transition-all font-khmer ${locale === 'km' ? 'bg-white text-slate-900 font-bold shadow-2xs' : 'text-slate-600 font-medium'}`}>
                ភាសាខ្មែរ (Khmer)
              </button>
              <button type="button" onClick={() => onLanguageChange('en')} className={`h-full flex-1 rounded-full transition-all ${locale === 'en' ? 'bg-white text-slate-900 font-bold shadow-2xs' : 'text-slate-600 font-medium'}`}>
                English (EN)
              </button>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="space-y-1 mb-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2.5 mb-1 block">{t('navigation') || 'Navigation'}</span>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
              return (
                <Link key={item.href} href={item.href} onClick={onClose} className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${isActive ? 'bg-teal-50 text-teal-900 font-bold border border-teal-200/60' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-teal-700' : 'text-slate-400'}`} />
                    <span className="font-khmer">{item.label}</span>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 ${isActive ? 'text-teal-700' : 'text-slate-300'}`} />
                </Link>
              );
            })}
          </div>
        </div>

        {/* Emergency & Quick Contacts in Drawer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-2">
          <button type="button" onClick={onOpenEmergency} className="w-full h-9 px-3 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 text-xs font-semibold flex items-center justify-center gap-2 transition shadow-2xs">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <span className="font-khmer">{t('emergency1515') || 'Rule 15-15 Protocol'}</span>
          </button>
          {patient?.emergencyContactPhone ? (
            <a href={`tel:${patient.emergencyContactPhone}`} className="w-full h-9 px-3 rounded-full bg-white hover:bg-slate-100 text-teal-800 border border-slate-200 text-xs font-medium flex items-center justify-center gap-2 transition">
              <PhoneCall className="w-3.5 h-3.5 text-teal-700" />
              <span className="font-khmer">{t('callEmergency') || 'Call Emergency Contact'}</span>
            </a>
          ) : null}
          <a href="tel:119" className="w-full h-8 px-3 rounded-full bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 text-[11px] font-medium flex items-center justify-center gap-2 transition">
            <Ambulance className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-khmer">{t('nationalAmbulance') || 'National Ambulance 119'}</span>
          </a>
        </div>
      </div>
    </div>,
    document.body
  );
}
