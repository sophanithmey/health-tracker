'use client';

import React, { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';
import axios from 'axios';
import { PatientProfile, DiabetesType } from '@/types';
import {
  Settings,
  Send,
  CheckCircle2,
  AlertCircle,
  Globe,
  Bell,
  User,
  ShieldAlert,
  Save
} from 'lucide-react';
import { useRole } from '@/context/RoleContext';

interface SettingsViewProps {
  patient: PatientProfile;
  onRefresh: () => void;
}

export function SettingsView({ patient, onRefresh }: SettingsViewProps) {
  const t = useTranslations('settings');
  const tPatient = useTranslations('patient');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { role } = useRole();

  // Telegram state
  const [telegramChatId, setTelegramChatId] = useState(patient.telegramChatId || '-100123456789');
  const [telegramEnabled, setTelegramEnabled] = useState(patient.telegramNotificationsEnabled ?? true);
  const [testStatus, setTestStatus] = useState<{ loading: boolean; message?: string; success?: boolean }>({
    loading: false
  });
  const [isSavingTelegram, setIsSavingTelegram] = useState(false);

  // Patient Profile state
  const [fullName, setFullName] = useState(patient.fullName);
  const [fullNameKm, setFullNameKm] = useState(patient.fullNameKm || 'ម៉ាក់ សុខា');
  const [diabetesType, setDiabetesType] = useState<DiabetesType>(patient.diabetesType);
  const [currentMeds, setCurrentMeds] = useState(patient.currentMedicationsSummary);
  const [emergencyName, setEmergencyName] = useState(patient.emergencyContactName);
  const [emergencyPhone, setEmergencyPhone] = useState(patient.emergencyContactPhone);
  const [isSavingPatient, setIsSavingPatient] = useState(false);
  const [patientSuccess, setPatientSuccess] = useState(false);

  const handleLanguageChange = (newLocale: 'km' | 'en') => {
    router.replace(pathname, { locale: newLocale });
  };

  const handleTestTelegram = async () => {
    setTestStatus({ loading: true });
    try {
      const res = await axios.post('/api/telegram/test', {
        chatId: telegramChatId
      });
      if (res.data?.success) {
        setTestStatus({
          loading: false,
          success: true,
          message: t('telegramSuccess')
        });
      } else {
        setTestStatus({
          loading: false,
          success: false,
          message: res.data?.error || 'Failed to send test message'
        });
      }
    } catch (err: any) {
      setTestStatus({
        loading: false,
        success: false,
        message: err.response?.data?.error || err.message || 'Error sending test message'
      });
    }
  };

  const handleSaveTelegram = async () => {
    setIsSavingTelegram(true);
    try {
      await axios.post('/api/telegram/config', {
        chatId: telegramChatId,
        notificationsEnabled: telegramEnabled
      });
      onRefresh();
      alert('Telegram settings saved');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to save telegram settings');
    } finally {
      setIsSavingTelegram(false);
    }
  };

  const handleSavePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPatient(true);
    setPatientSuccess(false);
    try {
      await axios.patch('/api/patient', {
        fullName,
        fullNameKm,
        diabetesType,
        currentMedicationsSummary: currentMeds,
        emergencyContactName: emergencyName,
        emergencyContactPhone: emergencyPhone
      });
      setPatientSuccess(true);
      setTimeout(() => setPatientSuccess(false), 3000);
      onRefresh();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update patient profile');
    } finally {
      setIsSavingPatient(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Language Preferences */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-teal-100 flex items-center justify-center text-teal-700">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">{t('language')}</h3>
            <p className="text-xs text-slate-500">Bilingual Khmer and English support</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 max-w-sm">
          <button
            onClick={() => handleLanguageChange('km')}
            className={`p-3 rounded-2xl border text-center font-bold text-sm transition touch-target ${
              locale === 'km'
                ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {t('khmer')}
          </button>
          <button
            onClick={() => handleLanguageChange('en')}
            className={`p-3 rounded-2xl border text-center font-bold text-sm transition touch-target ${
              locale === 'en'
                ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {t('english')}
          </button>
        </div>
      </div>

      {/* 2. Telegram Family Bot Notifications */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">{t('telegramSection')}</h3>
            <p className="text-xs text-slate-500">{t('telegramHelp')}</p>
          </div>
        </div>

        <div className="space-y-3 max-w-lg">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              {t('telegramChatId')}
            </label>
            <input
              type="text"
              value={telegramChatId}
              onChange={(e) => setTelegramChatId(e.target.value)}
              placeholder="-100123456789 or @family_diabetes_group"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-mono focus:bg-white focus:outline-none"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Server-side security: Bot tokens remain strictly private on the Next.js server layer.
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="tg-enabled"
              checked={telegramEnabled}
              onChange={(e) => setTelegramEnabled(e.target.checked)}
              className="w-4 h-4 text-teal-600 rounded"
            />
            <label htmlFor="tg-enabled" className="text-xs font-medium text-slate-700">
              Enable family alerts (Critical low, high glucose, missed measurements)
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2">
            <button
              onClick={handleSaveTelegram}
              disabled={isSavingTelegram}
              className="px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl text-xs transition"
            >
              {isSavingTelegram ? tCommon('loading') : tCommon('save')}
            </button>

            <button
              onClick={handleTestTelegram}
              disabled={testStatus.loading || !telegramChatId}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition flex items-center space-x-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{testStatus.loading ? 'Sending...' : t('testTelegram')}</span>
            </button>
          </div>

          {testStatus.message && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center space-x-2 ${
                testStatus.success
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {testStatus.success ? (
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
              )}
              <span>{testStatus.message}</span>
            </div>
          )}
        </div>
      </div>

      {/* 3. Patient Profile Details */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-100 flex items-center justify-center text-teal-700">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">{t('patientProfile')}</h3>
            <p className="text-xs text-slate-500">
              Configurable medical profile details (Age 60-69)
            </p>
          </div>
        </div>

        <form onSubmit={handleSavePatient} className="space-y-4 max-w-lg text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-600 mb-1">
                Name (English)
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-600 mb-1">
                Name (Khmer)
              </label>
              <input
                type="text"
                value={fullNameKm}
                onChange={(e) => setFullNameKm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">
              {tPatient('diabetesType')} (Must remain configurable)
            </label>
            <select
              value={diabetesType}
              onChange={(e) => setDiabetesType(e.target.value as DiabetesType)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold"
            >
              <option value="unknown">{tPatient('unknownType')}</option>
              <option value="type_1">{tPatient('type1')}</option>
              <option value="type_2">{tPatient('type2')}</option>
              <option value="other">{tPatient('otherType')}</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">
              {tPatient('currentMedication')}
            </label>
            <input
              type="text"
              value={currentMeds}
              onChange={(e) => setCurrentMeds(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:bg-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-600 mb-1">
                Emergency Contact Name
              </label>
              <input
                type="text"
                value={emergencyName}
                onChange={(e) => setEmergencyName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-600 mb-1">
                Emergency Contact Phone
              </label>
              <input
                type="text"
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500">
            Timezone: <strong>Asia/Phnom_Penh (UTC+7)</strong> • Default Glucose Unit: <strong>mg/dL</strong>
          </div>

          <div className="flex items-center space-x-3 pt-2">
            <button
              type="submit"
              disabled={isSavingPatient}
              className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl text-xs shadow transition"
            >
              {isSavingPatient ? tCommon('loading') : tCommon('save')}
            </button>
            {patientSuccess && (
              <span className="text-emerald-700 font-bold flex items-center text-xs">
                <CheckCircle2 className="w-4 h-4 mr-1" />
                {tCommon('saved')}
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

