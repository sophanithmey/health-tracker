import apiClient from '@/lib/api-client';

export interface TelegramConfigResponse {
  configured: boolean;
  botUsername?: string;
  hasToken: boolean;
  hasChatId: boolean;
  twoWayEnabled: boolean;
  webhookUrl?: string;
}

export const telegramService = {
  async getConfig(): Promise<TelegramConfigResponse> {
    const res = await apiClient.get<{ success: boolean; data: TelegramConfigResponse }>('/api/telegram/config');
    return res.data.data;
  },

  async updateConfig(payload: Record<string, unknown>): Promise<any> {
    const res = await apiClient.post<{ success: boolean; data: any }>('/api/telegram/config', payload);
    return res.data.data;
  },

  async sendTestMessage(message?: string): Promise<any> {
    const res = await apiClient.post<{ success: boolean; data: any }>('/api/telegram/test', { message });
    return res.data.data;
  },

  async setupWebhook(action: 'set' | 'delete' | 'info'): Promise<any> {
    const res = await apiClient.post<{ success: boolean; data: any }>('/api/telegram/webhook/setup', { action });
    return res.data.data;
  }
};
