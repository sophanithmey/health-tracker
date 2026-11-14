'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';
import { useQueryClient } from '@tanstack/react-query';
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
  Stethoscope,
  HeartHandshake,
  ShieldAlert,
  Save,
  Bot,
  Zap,
  Check,
  Copy
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
  const queryClient = useQueryClient();

  // Telegram state
  const [telegramChatId, setTelegramChatId] = useState(patient.telegramChatId || '');
  const [telegramEnabled, setTelegramEnabled] = useState(patient.telegramNotificationsEnabled ?? true);
  const [testStatus, setTestStatus] = useState<{ loading: boolean; message?: string; success?: boolean }>({
    loading: false
  });
  const [isSavingTelegram, setIsSavingTelegram] = useState(false);
  const [webhookStatus, setWebhookStatus] = useState<{
    loading: boolean;
    message?: string;
    success?: boolean;
    url?: string;
  }>({ loading: false });
  const [copiedPill, setCopiedPill] = useState<string | null>(null);

  const handleCopyText = (text: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedPill(text);
      setTimeout(() => setCopiedPill(null), 2000);
    }
  };

  const handleSyncWebhook = async () => {
    setWebhookStatus({ loading: true });
    try {
      const res = await axios.post('/api/telegram/webhook/setup', { action: 'set' });
      if (res.data?.success) {
        setWebhookStatus({
          loading: false,
          success: true,
          message: t('telegramWebhookSuccess'),
          url: res.data?.data?.webhookUrl
        });
      } else {
        setWebhookStatus({
          loading: false,
          success: false,
          message: res.data?.error || res.data?.data?.description || 'Failed to register webhook'
        });
      }
    } catch (err: any) {
      setWebhookStatus({
        loading: false,
        success: false,
        message: err.response?.data?.error || err.message || 'Error configuring webhook'
      });
    }
  };

  // Patient Profile state
  const [fullName, setFullName] = useState(patient.fullName || '');
  const [fullNameKm, setFullNameKm] = useState(patient.fullNameKm || '');
  const [ageGroup, setAgeGroup] = useState(patient.ageGroup || '60-69');
  const [diabetesType, setDiabetesType] = useState<DiabetesType>(patient.diabetesType || 'unknown');
  const [currentMeds, setCurrentMeds] = useState(patient.currentMedicationsSummary || '');
  const [doctorName, setDoctorName] = useState(patient.doctorName || '');
  const [doctorPhone, setDoctorPhone] = useState(patient.doctorPhone || '');
  const [doctorClinic, setDoctorClinic] = useState(patient.doctorClinic || '');
  const [emergencyName, setEmergencyName] = useState(patient.emergencyContactName || '');
  const [emergencyPhone, setEmergencyPhone] = useState(patient.emergencyContactPhone || '');
  const [emergencyRelation, setEmergencyRelation] = useState(patient.emergencyContactRelation || '');
  const [medicalHistory, setMedicalHistory] = useState(patient.medicalHistory || '');

  const [isSavingPatient, setIsSavingPatient] = useState(false);
  const [patientSuccess, setPatientSuccess] = useState(false);

  // Sync state when patient prop changes (e.g. from refetch or database update)
  useEffect(() => {
    if (patient) {
      setFullName(patient.fullName || '');
      setFullNameKm(patient.fullNameKm || '');
      setAgeGroup(patient.ageGroup || '60-69');
      setDiabetesType(patient.diabetesType || 'unknown');
      setCurrentMeds(patient.currentMedicationsSummary || '');
      setDoctorName(patient.doctorName || '');
      setDoctorPhone(patient.doctorPhone || '');
      setDoctorClinic(patient.doctorClinic || '');
      setEmergencyName(patient.emergencyContactName || '');
      setEmergencyPhone(patient.emergencyContactPhone || '');
      setEmergencyRelation(patient.emergencyContactRelation || '');
      setMedicalHistory(patient.medicalHistory || '');
      setTelegramChatId(patient.telegramChatId || '');
      setTelegramEnabled(patient.telegramNotificationsEnabled ?? true);
    }
  }, [patient]);

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
        patientId: patient.id,
        chatId: telegramChatId,
        notificationsEnabled: telegramEnabled
      });
      await queryClient.invalidateQueries({ queryKey: ['patient'] });
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
        patientId: patient.id,
        fullName,
        fullNameKm,
        ageGroup,
        diabetesType,
        currentMedicationsSummary: currentMeds,
        doctorName,
        doctorPhone,
        doctorClinic,
        emergencyContactName: emergencyName,
        emergencyContactPhone: emergencyPhone,
        emergencyContactRelation: emergencyRelation,
        medicalHistory
      });
      setPatientSuccess(true);
      setTimeout(() => setPatientSuccess(false), 3000);
      await queryClient.invalidateQueries({ queryKey: ['patient'] });
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

      {/* 2. Patient Medical Profile Details */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-100 flex items-center justify-center text-teal-700">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">{t('patientProfile')}</h3>
            <p className="text-xs text-slate-500">
              Personalized medical profile details &amp; clinician contacts
            </p>
          </div>
        </div>

        <form onSubmit={handleSavePatient} className="space-y-4 max-w-2xl text-xs">
          {/* Identity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-600 mb-1">
                Name (English) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Mom Sokha"
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
                placeholder="e.g. ម៉ាក់ សុខា"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-khmer focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-600 mb-1">
                Age Group
              </label>
              <select
                value={ageGroup}
                onChange={(e) => setAgeGroup(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold"
              >
                <option value="50-59">50–59</option>
                <option value="60-69">60–69 (Patient Profile)</option>
                <option value="70-79">70–79</option>
                <option value="80+">80+</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-600 mb-1">
                {tPatient('diabetesType')} (Configurable)
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
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">
              {tPatient('currentMedication')}
            </label>
            <input
              type="text"
              value={currentMeds}
              onChange={(e) => setCurrentMeds(e.target.value)}
              placeholder="e.g. Oral medication (Metformin 500mg)"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:bg-white focus:outline-none"
            />
          </div>

          {/* Clinician Contact */}
          <div className="pt-2 border-t border-slate-200">
            <h4 className="font-bold text-slate-800 text-xs mb-2 flex items-center space-x-1.5">
              <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
              <span>Attending Clinician &amp; Clinic</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Doctor Name</label>
                <input
                  type="text"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  placeholder="e.g. Dr. Keo"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:bg-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Doctor Phone</label>
                <input
                  type="text"
                  value={doctorPhone}
                  onChange={(e) => setDoctorPhone(e.target.value)}
                  placeholder="e.g. +855 12 345 678"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:bg-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Clinic / Hospital</label>
                <input
                  type="text"
                  value={doctorClinic}
                  onChange={(e) => setDoctorClinic(e.target.value)}
                  placeholder="e.g. Diabetes Clinic"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:bg-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="pt-2 border-t border-slate-200">
            <h4 className="font-bold text-slate-800 text-xs mb-2 flex items-center space-x-1.5">
              <HeartHandshake className="w-3.5 h-3.5 text-emerald-600" />
              <span>Family Emergency Contact</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Contact Name</label>
                <input
                  type="text"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  placeholder="e.g. Dara Mey"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:bg-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  placeholder="e.g. +855 17 888 999"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:bg-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Relationship</label>
                <input
                  type="text"
                  value={emergencyRelation}
                  onChange={(e) => setEmergencyRelation(e.target.value)}
                  placeholder="e.g. Son, Daughter, Child"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:bg-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Medical Notes */}
          <div>
            <label className="block font-semibold text-slate-600 mb-1">
              Medical History &amp; Allergies
            </label>
            <textarea
              rows={2}
              value={medicalHistory}
              onChange={(e) => setMedicalHistory(e.target.value)}
              placeholder="e.g. Hypertension history, Penicillin allergy"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:bg-white focus:outline-none"
            />
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500">
            Timezone: <strong>Asia/Phnom_Penh (UTC+7)</strong> • Default Glucose Unit: <strong>mg/dL</strong>
          </div>

          <div className="flex items-center space-x-3 pt-2">
            <button
              type="submit"
              disabled={isSavingPatient}
              className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl text-xs shadow transition flex items-center space-x-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSavingPatient ? tCommon('loading') : tCommon('save')}</span>
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

      {/* 3. Telegram Family Bot Notifications & Two-Way Logging */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">{t('telegramSection')}</h3>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200/70">
                  <Zap className="w-3 h-3 text-teal-600" />
                  Two-Way Bot Active
                </span>
              </div>
              <p className="text-xs text-slate-500">{t('telegramTwoWayDesc')}</p>
            </div>
          </div>
        </div>

        {/* Configuration Inputs */}
        <div className="space-y-3 max-w-xl">
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

            <button
              onClick={handleSyncWebhook}
              disabled={webhookStatus.loading}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition flex items-center space-x-1.5"
            >
              <Zap className="w-3.5 h-3.5 text-teal-600" />
              <span>{webhookStatus.loading ? 'Connecting...' : t('telegramSetupWebhook')}</span>
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

          {webhookStatus.message && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center space-x-2 ${
                webhookStatus.success
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}
            >
              {webhookStatus.success ? (
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
              )}
              <div>
                <span>{webhookStatus.message}</span>
                {webhookStatus.url && (
                  <div className="font-mono text-[10px] text-slate-500 mt-0.5 break-all">
                    {webhookStatus.url}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Two-Way Bot Interactive Commands & Logging Guide */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <span>📱</span> {t('telegramCommandsTitle')}
            </h4>
            <span className="text-[11px] text-slate-400">Click to copy example</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {[
              { text: '148 fasting', label: t('telegramExample1') },
              { text: '១៤៨ មុនបាយ', label: 'Khmer: ១៤៨ មុនបាយ' },
              { text: '165 after lunch', label: t('telegramExample2') },
              { text: '១៦៥ ក្រោយបាយ', label: 'Khmer: ១៦៥ ក្រោយបាយ' },
              { text: '148', label: t('telegramExample3') },
              { text: '/latest', label: t('telegramExample4') },
              { text: '/targets', label: t('telegramExample5') },
              { text: '/meds', label: t('telegramExample6') }
            ].map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleCopyText(item.text)}
                className="text-left p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/70 transition flex items-center justify-between group"
              >
                <div className="min-w-0 pr-2">
                  <div className="font-mono font-bold text-teal-800 text-xs">{item.text}</div>
                  <div className="text-[11px] text-slate-500 truncate">{item.label}</div>
                </div>
                <div className="flex-shrink-0 text-slate-400 group-hover:text-teal-700">
                  {copiedPill === item.text ? (
                    <span className="flex items-center text-[10px] text-emerald-600 font-bold gap-0.5">
                      <Check className="w-3.5 h-3.5" /> Copied
                    </span>
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
