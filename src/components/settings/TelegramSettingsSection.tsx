import React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Bot, Send, Zap, CheckCircle2, AlertCircle, Copy, Check, Save } from 'lucide-react';
import { useTelegramSettings } from '@/hooks/use-telegram-settings';
import { PatientProfile } from '@/types';

interface TelegramSettingsSectionProps {
  patient: PatientProfile;
  onRefresh: () => void;
}

export function TelegramSettingsSection({ patient, onRefresh }: TelegramSettingsSectionProps) {
  const t = useTranslations('settings');
  const locale = useLocale();

  const {
    telegramChatId,
    setTelegramChatId,
    telegramEnabled,
    setTelegramEnabled,
    testStatus,
    isSavingTelegram,
    webhookStatus,
    copiedPill,
    handleCopyText,
    handleSyncWebhook,
    handleTestTelegram,
    handleSaveTelegram
  } = useTelegramSettings(patient, onRefresh);

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
      <div className="flex items-center space-x-3.5 border-b border-slate-100 pb-4">
        <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200/60 text-teal-700 flex items-center justify-center flex-shrink-0 shadow-xs">
          <Bot className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900 font-khmer">
            {t('telegramTwoWayTitle') || 'Telegram Two-Way Bot Integration'}
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            {t('telegramTwoWayDesc') || 'Instant blood sugar logging & emergency alerts via Telegram'}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            {t('telegramChatId')}
          </label>
          <input
            type="text"
            value={telegramChatId}
            onChange={(e) => setTelegramChatId(e.target.value)}
            placeholder="e.g. 123456789 or @family_chat_id"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="telegramEnabled"
            checked={telegramEnabled}
            onChange={(e) => setTelegramEnabled(e.target.checked)}
            className="w-4 h-4 text-teal-600 rounded-md border-slate-300 focus:ring-teal-500"
          />
          <label htmlFor="telegramEnabled" className="text-xs font-bold text-slate-700 cursor-pointer">
            {t('telegramEnabled') || 'Enable automatic Telegram alerts'}
          </label>
        </div>

        {/* Action Buttons: Save & Test */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleSaveTelegram}
            disabled={isSavingTelegram}
            className="px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center space-x-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSavingTelegram ? 'Saving...' : t('saveTelegram')}</span>
          </button>

          <button
            type="button"
            onClick={handleTestTelegram}
            disabled={testStatus.loading}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center space-x-1.5"
          >
            <Send className="w-3.5 h-3.5 text-teal-600" />
            <span>{testStatus.loading ? 'Sending...' : t('testNotification')}</span>
          </button>

          <button
            type="button"
            onClick={handleSyncWebhook}
            disabled={webhookStatus.loading}
            className="px-4 py-2.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold rounded-xl transition flex items-center space-x-1.5"
          >
            <Zap className="w-3.5 h-3.5 text-teal-600" />
            <span>{webhookStatus.loading ? 'Syncing...' : 'Sync Webhook'}</span>
          </button>
        </div>

        {testStatus.message ? (
          <div
            className={`p-3 rounded-xl text-xs font-bold flex items-center space-x-2 ${
              testStatus.success ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700'
            }`}
          >
            {testStatus.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{testStatus.message}</span>
          </div>
        ) : null}

        {webhookStatus.message ? (
          <div
            className={`p-3 rounded-xl text-xs font-bold flex items-center space-x-2 ${
              webhookStatus.success ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700'
            }`}
          >
            {webhookStatus.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{webhookStatus.message}</span>
          </div>
        ) : null}

        {/* Quick Commands Guide */}
        <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
          <span className="text-xs font-bold text-slate-700 block mb-2">
            Try sending these messages to Mom&apos;s Telegram Bot:
          </span>
          <div className="flex flex-wrap gap-2 text-xs">
            {['148 fasting', '១៤៨ មុនបាយ', '165 after lunch', '/targets', '/meds', '/latest'].map((cmd) => (
              <button
                type="button"
                key={cmd}
                onClick={() => handleCopyText(cmd)}
                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 font-mono text-[11px] text-slate-700 hover:border-teal-400 transition flex items-center space-x-1"
              >
                <span>{cmd}</span>
                {copiedPill === cmd ? (
                  <Check className="w-3 h-3 text-emerald-600" />
                ) : (
                  <Copy className="w-3 h-3 text-slate-400" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
