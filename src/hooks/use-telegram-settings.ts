import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { patientService } from '@/services/patient-service';
import { telegramService } from '@/services/telegram-service';
import { PatientProfile } from '@/types';

export function useTelegramSettings(patient: PatientProfile, onRefresh: () => void) {
  const t = useTranslations('settings');

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
      const res = await telegramService.setupWebhook('set');
      if (res?.success ?? true) {
        setWebhookStatus({
          loading: false,
          success: true,
          message: t('telegramWebhookSuccess') || 'Webhook registered successfully',
          url: res?.data?.webhookUrl || res?.webhookUrl
        });
      } else {
        setWebhookStatus({
          loading: false,
          success: false,
          message: res?.error || res?.data?.description || 'Failed to register webhook'
        });
      }
    } catch (err: any) {
      setWebhookStatus({
        loading: false,
        success: false,
        message: err.message || 'Error configuring webhook'
      });
    }
  };

  const handleTestTelegram = async () => {
    setTestStatus({ loading: true });
    try {
      await telegramService.sendTestMessage();
      setTestStatus({
        loading: false,
        success: true,
        message: t('testSentSuccess') || 'Test notification sent to Telegram'
      });
    } catch (err: any) {
      setTestStatus({
        loading: false,
        success: false,
        message: err.message || 'Failed to send test message'
      });
    }
  };

  const handleSaveTelegram = async () => {
    setIsSavingTelegram(true);
    try {
      await patientService.updatePatient({
        telegramChatId: telegramChatId.trim(),
        telegramNotificationsEnabled: telegramEnabled
      });
      onRefresh();
      alert(t('saveSuccess') || 'Telegram settings updated successfully');
    } catch (err: any) {
      alert(err.message || 'Failed to update Telegram settings');
    } finally {
      setIsSavingTelegram(false);
    }
  };

  return {
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
  };
}
