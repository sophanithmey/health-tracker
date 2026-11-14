'use client';

import React, { useState, useEffect } from 'react';
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
  HeartHandshake,
  PhoneCall,
  CheckCircle2,
  Stethoscope,
  ChevronRight,
  Globe
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Listen for mobile drawer open requests from bottom nav
  useEffect(() => {
    const handleToggle = () => setIsMobileMenuOpen((prev) => !prev);
    const handleOpen = () => setIsMobileMenuOpen(true);
    window.addEventListener('toggle-mobile-menu', handleToggle);
    window.addEventListener('open-mobile-menu', handleOpen);
    return () => {
      window.removeEventListener('toggle-mobile-menu', handleToggle);
      window.removeEventListener('open-mobile-menu', handleOpen);
    };
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const { data: patient } = useQuery<PatientProfile>({
    queryKey: ['patient'],
    queryFn: async () => {
      const res = await axios.get('/api/patient');
      return res.data?.data;
    },
    staleTime: 0
  });

  const patientDisplayName = patient
    ? locale === 'km'
      ? patient.fullNameKm || patient.fullName
      : patient.fullName
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
            <Link href="/" className="flex items-center space-x-2.5 sm:space-x-3 group flex-shrink-0">
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
                  <span className="hidden lg:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/80">
                    {patientDisplayName || 'Mom'} (Live)
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                  {patient
                    ? locale === 'km'
                      ? `ប្រព័ន្ធតាមដានជាតិស្ករ និងសុខភាពសម្រាប់ ${patientDisplayName}`
                      : `Family Health & Blood Sugar Monitoring for ${patient.fullName}`
                    : t('appTagline')}
                </p>
              </div>
            </Link>

            {/* Right: Controls & Emergency Button */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Emergency 15-15 Rule Button */}
              <button
                type="button"
                onClick={() => setIsEmergencyModalOpen(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold transition shadow-2xs touch-target"
                title="Emergency Guidance & 15-15 Rule"
              >
                <ShieldAlert className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span className="hidden sm:inline">15-15 Rule</span>
                <span className="sm:hidden font-bold">15-15</span>
              </button>

              {/* Desktop Only: Role Switcher Pill */}
              <div className="hidden md:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => switchRole('family_admin')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                    role === 'family_admin'
                      ? 'bg-teal-700 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Caregiver Control Mode"
                >
                  <span>{t('roleCaregiver')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => switchRole('clinician')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                    role === 'clinician'
                      ? 'bg-blue-700 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Healthcare Professional Review Mode"
                >
                  <span>{locale === 'km' ? 'វេជ្ជបណ្ឌិត' : 'Clinician'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => switchRole('patient')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                    role === 'patient'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title={patientDisplayName ? `${patientDisplayName} (Senior Mode)` : 'Patient (Senior Mode)'}
                >
                  <span>
                    {patientDisplayName
                      ? locale === 'km'
                        ? `${patientDisplayName} (អ្នកជំងឺ)`
                        : `${patient?.fullName} (Patient)`
                      : t('rolePatient')}
                  </span>
                </button>
              </div>

              {/* Language Switcher */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
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
                  type="button"
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

              {/* Mobile Hamburger Menu Toggle Button */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200/80 transition touch-target"
                aria-label={isMobileMenuOpen ? 'Close Menu' : 'Open Navigation Menu'}
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5 text-slate-900" />
                ) : (
                  <Menu className="w-5 h-5 text-slate-900" />
                )}
              </button>
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
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex-shrink-0 touch-target ${
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

      {/* -------------------------------------------------------------------- */}
      {/* MOBILE SLIDE-OUT NAVIGATION DRAWER                                   */}
      {/* -------------------------------------------------------------------- */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer Container */}
          <div className="relative ml-auto w-full max-w-sm bg-white h-full shadow-2xl flex flex-col z-10 animate-slide-left overflow-y-auto">
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-700 flex items-center justify-center text-white shadow-xs">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 font-khmer">
                    {patientDisplayName || t('appName')}
                  </h3>
                  <div className="flex items-center space-x-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[11px] font-bold text-emerald-800">
                      {locale === 'km' ? 'ប្រព័ន្ធតាមដានផ្ទាល់' : 'Active Patient (Live)'}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 transition shadow-2xs"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="p-5 space-y-6 flex-1">
              {/* Role Switcher Section in Drawer */}
              <div>
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 block mb-2 font-khmer">
                  {locale === 'km' ? 'ប្តូរតួនាទីប្រើប្រាស់' : 'Active Role / View Mode'}
                </label>
                <div className="space-y-1.5 bg-slate-50 p-2 rounded-2xl border border-slate-200/80">
                  <button
                    type="button"
                    onClick={() => {
                      switchRole('family_admin');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition text-left ${
                      role === 'family_admin'
                        ? 'bg-teal-700 text-white shadow-xs'
                        : 'text-slate-700 hover:bg-slate-200/60'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <HeartHandshake className="w-4 h-4 flex-shrink-0" />
                      <div>
                        <div>{t('roleCaregiver')}</div>
                        <div className={`text-[10px] ${role === 'family_admin' ? 'text-teal-100' : 'text-slate-400'}`}>
                          {locale === 'km' ? 'គ្រប់គ្រង និងកត់ត្រាថែទាំ' : 'Full caregiver controls'}
                        </div>
                      </div>
                    </div>
                    {role === 'family_admin' && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      switchRole('clinician');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition text-left ${
                      role === 'clinician'
                        ? 'bg-blue-700 text-white shadow-xs'
                        : 'text-slate-700 hover:bg-slate-200/60'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Stethoscope className="w-4 h-4 flex-shrink-0" />
                      <div>
                        <div>{locale === 'km' ? 'វេជ្ជបណ្ឌិត (Clinician)' : 'Attending Clinician'}</div>
                        <div className={`text-[10px] ${role === 'clinician' ? 'text-blue-100' : 'text-slate-400'}`}>
                          {locale === 'km' ? 'ពិនិត្យ & អនុម័តគោលដៅ' : 'Clinical reviews & target approval'}
                        </div>
                      </div>
                    </div>
                    {role === 'clinician' && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      switchRole('patient');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition text-left ${
                      role === 'patient'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-700 hover:bg-slate-200/60'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <User className="w-4 h-4 flex-shrink-0" />
                      <div>
                        <div>{patientDisplayName ? `${patientDisplayName} (${locale === 'km' ? 'អ្នកជំងឺ' : 'Patient'})` : t('rolePatient')}</div>
                        <div className={`text-[10px] ${role === 'patient' ? 'text-emerald-100' : 'text-slate-400'}`}>
                          {locale === 'km' ? 'ទម្រង់ងាយស្រួលអក្សរធំសម្រាប់ម៉ាក់' : 'Senior simplified mode'}
                        </div>
                      </div>
                    </div>
                    {role === 'patient' && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </button>
                </div>
              </div>

              {/* All Navigation Links */}
              <div>
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 block mb-2 font-khmer">
                  {locale === 'km' ? 'ទំព័រកម្មវិធីទាំងអស់' : 'All Destinations'}
                </label>
                <div className="space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center justify-between p-3 rounded-2xl text-sm font-bold transition touch-target ${
                          isActive
                            ? 'bg-teal-50 text-teal-900 border border-teal-200/80 shadow-2xs'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                              isActive ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="font-khmer">{item.label}</span>
                        </div>
                        <ChevronRight className={`w-4 h-4 ${isActive ? 'text-teal-700' : 'text-slate-300'}`} />
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Emergency Quick Actions in Drawer */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsEmergencyModalOpen(true);
                  }}
                  className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-2xl shadow-sm transition touch-target text-xs"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>{locale === 'km' ? 'សង្គ្រោះបន្ទាន់ជាតិស្ករ 15-15 Rule' : 'Emergency 15-15 Rule'}</span>
                </button>

                <a
                  href="tel:119"
                  className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-2xl font-bold transition touch-target text-xs"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>{locale === 'km' ? 'ហៅសង្គ្រោះបន្ទាន់ 119 (Ambulance)' : 'Call Ambulance 119'}</span>
                </a>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="font-medium">Language:</span>
              <div className="flex items-center space-x-1 bg-white p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => handleLanguageChange('km')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    locale === 'km' ? 'bg-teal-700 text-white' : 'text-slate-600'
                  }`}
                >
                  ខ្មែរ
                </button>
                <button
                  type="button"
                  onClick={() => handleLanguageChange('en')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    locale === 'en' ? 'bg-teal-700 text-white' : 'text-slate-600'
                  }`}
                >
                  English
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Emergency 15-15 Guidance Modal */}
      <EmergencyHypoBanner
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
      />
    </>
  );
}
