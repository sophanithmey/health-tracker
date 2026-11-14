'use client';

import React, { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { usePathname, useRouter, Link } from '@/i18n/routing';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { PatientProfile } from '@/types';
import {
  Activity,
  Droplet,
  Pill,
  Utensils,
  Target,
  FileText,
  Settings,
  BookOpen,
  ShieldAlert,
  Menu,
  X,
  User,
  HeartHandshake
} from 'lucide-react';
import { useRole } from '@/context/RoleContext';
import { EmergencyHypoBanner } from './EmergencyHypoBanner';

export function AppHeader() {
  const t = useTranslations('common');
  const tNav = useTranslations('nav');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { role, switchRole } = useRole();
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);

  const { data: patient } = useQuery<PatientProfile>({
    queryKey: ['patient'],
    queryFn: async () => {
      const res = await axios.get('/api/patient');
      return res.data?.data;
    },
    staleTime: 0
  });

  const patientDisplayName = patient
    ? (locale === 'km' ? (patient.fullNameKm || patient.fullName) : patient.fullName)
    : '';

  const handleLanguageChange = (newLocale: 'km' | 'en') => {
    router.replace(pathname, { locale: newLocale });
  };

  const navItems = [
    { href: '/', label: tNav('dashboard'), icon: Activity },
    { href: '/blood-sugar', label: tNav('bloodSugar'), icon: Droplet },
    { href: '/medications', label: tNav('medications'), icon: Pill },
    { href: '/lifestyle', label: tNav('lifestyle'), icon: Utensils },
    { href: '/targets', label: tNav('targets'), icon: Target },
    { href: '/knowledge', label: tNav('knowledge'), icon: BookOpen },
    { href: '/reports', label: tNav('reports'), icon: FileText },
    { href: '/settings', label: tNav('settings'), icon: Settings }
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
        {/* Tier 1: Main Brand & Utility Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18">
            {/* Left: Brand Identity & Patient Pulse */}
            <Link href="/" className="flex items-center space-x-3 group flex-shrink-0">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-teal-700 flex items-center justify-center text-white shadow-sm shadow-teal-700/20 group-hover:scale-105 transition">
                  <Activity className="w-5 h-5" />
                </div>
                <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-white"></span>
                </span>
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-tight font-khmer">
                    {t('appName')}
                  </span>
                  <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/80">
                    {patientDisplayName || 'Patient'} (Live)
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                  {patient
                    ? (locale === 'km'
                        ? `ប្រព័ន្ធតាមដានជាតិស្ករ និងសុខភាពសម្រាប់ ${patientDisplayName}`
                        : `Family Health & Blood Sugar Monitoring for ${patient.fullName}`)
                    : t('appTagline')}
                </p>
              </div>
            </Link>

            {/* Right: Controls & Emergency Button */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Emergency 15-15 Rule Button */}
              <button
                onClick={() => setIsEmergencyModalOpen(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold transition shadow-2xs touch-target"
                title="Emergency Guidance & 15-15 Rule"
              >
                <ShieldAlert className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span className="hidden sm:inline">15-15 Rule</span>
                <span className="sm:hidden font-bold">15-15</span>
              </button>

              {/* Role Switcher Pill */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  onClick={() => switchRole('family_admin')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                    role === 'family_admin'
                      ? 'bg-teal-700 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Caregiver Control Mode"
                >
                  <span className="hidden sm:inline">{t('roleCaregiver')}</span>
                  <span className="sm:hidden">Caregiver</span>
                </button>
                <button
                  onClick={() => switchRole('patient')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                    role === 'patient'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title={patientDisplayName ? `${patientDisplayName} (Senior Mode)` : 'Patient (Senior Mode)'}
                >
                  <span className="hidden sm:inline">
                    {patientDisplayName
                      ? (locale === 'km' ? `${patientDisplayName} (អ្នកជំងឺ)` : `${patient?.fullName} (Patient)`)
                      : t('rolePatient')}
                  </span>
                  <span className="sm:hidden">
                    {patientDisplayName ? patientDisplayName.split(' ')[0] : 'Patient'}
                  </span>
                </button>
              </div>

              {/* Language Switcher */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  onClick={() => handleLanguageChange('km')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                    locale === 'km'
                      ? 'bg-white text-teal-800 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  ខ្មែរ
                </button>
                <button
                  onClick={() => handleLanguageChange('en')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                    locale === 'en'
                      ? 'bg-white text-teal-800 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  EN
                </button>
              </div>
            </div>
          </div>

          {/* Tier 2: Horizontal Segmented Tab Navigation (Desktop & Tablet) */}
          <div className="hidden md:flex items-center space-x-1 sm:space-x-2 py-2 overflow-x-auto scrollbar-none border-t border-slate-100">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                    isActive
                      ? 'bg-teal-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      {/* Emergency 15-15 Guidance Modal */}
      <EmergencyHypoBanner
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
      />
    </>
  );
}
