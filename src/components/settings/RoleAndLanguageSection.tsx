import React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';
import { useRole } from '@/context/RoleContext';
import { Globe, HeartHandshake, User, Stethoscope } from 'lucide-react';
import { UserRole } from '@/types';

export function RoleAndLanguageSection() {
  const t = useTranslations('settings');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { role, switchRole } = useRole();

  const handleLanguageChange = (newLocale: 'km' | 'en') => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Role Switcher */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm font-khmer">
              {t('switchRole') || 'Active Role View'}
            </h3>
            <p className="text-xs text-slate-500">
              Change permissions and dashboard view
            </p>
          </div>
        </div>

        <div className="space-y-2">
          {[
            { id: 'family_admin', label: 'Family Caregiver (Admin)', icon: HeartHandshake },
            { id: 'clinician', label: 'Clinician / Doctor', icon: Stethoscope },
            { id: 'patient', label: 'Patient View (Mom)', icon: User }
          ].map((r) => {
            const Icon = r.icon;
            const isSelected = role === r.id;
            return (
              <button
                type="button"
                key={r.id}
                onClick={() => switchRole(r.id as UserRole)}
                className={`w-full p-3 rounded-2xl border text-left text-xs font-bold transition flex items-center justify-between ${
                  isSelected
                    ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{r.label}</span>
                </div>
                {isSelected ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white">
                    Active
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {/* Language Switcher */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm font-khmer">
              {t('language') || 'Language Selection'}
            </h3>
            <p className="text-xs text-slate-500">
              Bilingual Khmer &amp; English support
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleLanguageChange('km')}
            className={`p-4 rounded-2xl border text-center transition font-khmer ${
              locale === 'km'
                ? 'bg-teal-700 text-white border-teal-700 shadow-xs font-bold'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            <span className="text-base block">ភាសាខ្មែរ</span>
            <span className="text-xs opacity-80">Khmer</span>
          </button>

          <button
            type="button"
            onClick={() => handleLanguageChange('en')}
            className={`p-4 rounded-2xl border text-center transition ${
              locale === 'en'
                ? 'bg-teal-700 text-white border-teal-700 shadow-xs font-bold'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            <span className="text-base block font-bold">English</span>
            <span className="text-xs opacity-80">English (US)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
