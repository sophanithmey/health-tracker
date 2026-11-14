// ============================================================================
// Telegram Notification Service (សេវាជូនដំណឹងតេឡេក្រាមគ្រួសារ)
// Server-side only: Bot tokens strictly kept on the server layer
// ============================================================================

import axios from 'axios';

export interface TelegramMessagePayload {
  chatId: string;
  title: string;
  body: string;
  guidance?: string;
  category: 'critical' | 'attention' | 'info';
  locale?: 'km' | 'en';
}

export interface TelegramSendResult {
  success: boolean;
  messageId?: number;
  deliveryStatus: 'sent' | 'failed';
  error?: string;
  attempts: number;
}

export class TelegramService {
  private static getBotToken(): string | undefined {
    return process.env.TELEGRAM_BOT_TOKEN || process.env.NEXT_SERVER_TELEGRAM_BOT_TOKEN;
  }

  /**
   * Escape HTML entities to prevent malformed tags in Telegram HTML mode
   */
  public static escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  /**
   * Format message in Telegram HTML style
   */
  public static formatMessage(payload: TelegramMessagePayload): string {
    const icon =
      payload.category === 'critical' ? '🚨' : payload.category === 'attention' ? '⚠️' : 'ℹ️';

    const cleanTitle = this.escapeHtml(payload.title);
    const cleanBody = this.escapeHtml(payload.body);
    const cleanGuidance = payload.guidance ? this.escapeHtml(payload.guidance) : '';

    let formatted = `<b>${icon} ${cleanTitle}</b>\n\n`;
    formatted += `${cleanBody}\n`;

    if (cleanGuidance) {
      formatted += `\n<b>💡 Medical Guidance:</b>\n<i>${cleanGuidance}</i>\n`;
    }

    formatted += `\n— <i>Family Diabetes Care (ថែទាំជំងឺទឹកនោមផ្អែមគ្រួសារ)</i>`;
    return formatted;
  }

  /**
   * Send notification with automated retries (exponential backoff)
   */
  public static async sendNotification(
    payload: TelegramMessagePayload,
    maxRetries = 3
  ): Promise<TelegramSendResult> {
    const token = this.getBotToken();
    const text = this.formatMessage(payload);

    // If bot token is not configured in environment, simulate successful delivery in dev/demo mode
    if (!token) {
      console.log('--- [TELEGRAM DEV SIMULATION] ---');
      console.log(`To Chat ID: ${payload.chatId}`);
      console.log(`Content:\n${text}`);
      console.log('---------------------------------');
      return {
        success: true,
        messageId: Math.floor(Math.random() * 900000) + 100000,
        deliveryStatus: 'sent',
        attempts: 1
      };
    }

    const url = `https://api.telegram.org/bot${token}/sendMessage`;

    let attempts = 0;
    let lastError = '';

    while (attempts < maxRetries) {
      attempts++;
      try {
        const response = await axios.post(
          url,
          {
            chat_id: payload.chatId,
            text,
            parse_mode: 'HTML',
            disable_web_page_preview: true
          },
          { timeout: 8000 }
        );

        if (response.data && response.data.ok) {
          return {
            success: true,
            messageId: response.data.result.message_id,
            deliveryStatus: 'sent',
            attempts
          };
        } else {
          lastError = response.data?.description || 'Telegram API returned not ok';
        }
      } catch (err: any) {
        lastError = err.response?.data?.description || err.message || 'Unknown network error';
        // Wait before retry with exponential backoff (e.g. 500ms, 1500ms)
        if (attempts < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, attempts * 500));
        }
      }
    }

    return {
      success: false,
      deliveryStatus: 'failed',
      error: lastError,
      attempts
    };
  }

  /**
   * Send raw formatted text message to Telegram chat
   */
  public static async sendMessageRaw(
    chatId: string | number,
    text: string,
    options?: {
      parseMode?: 'HTML' | 'Markdown' | 'MarkdownV2';
      disableWebPagePreview?: boolean;
      maxRetries?: number;
    }
  ): Promise<TelegramSendResult> {
    const token = this.getBotToken();
    const parseMode = options?.parseMode ?? 'HTML';
    const disableWebPagePreview = options?.disableWebPagePreview ?? true;
    const maxRetries = options?.maxRetries ?? 3;

    if (!token) {
      console.log('--- [TELEGRAM DEV SIMULATION] ---');
      console.log(`To Chat ID: ${chatId}`);
      console.log(`Raw Message:\n${text}`);
      console.log('---------------------------------');
      return {
        success: true,
        messageId: Math.floor(Math.random() * 900000) + 100000,
        deliveryStatus: 'sent',
        attempts: 1
      };
    }

    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    let attempts = 0;
    let lastError = '';

    while (attempts < maxRetries) {
      attempts++;
      try {
        const response = await axios.post(
          url,
          {
            chat_id: chatId,
            text,
            parse_mode: parseMode,
            disable_web_page_preview: disableWebPagePreview
          },
          { timeout: 8000 }
        );

        if (response.data && response.data.ok) {
          return {
            success: true,
            messageId: response.data.result.message_id,
            deliveryStatus: 'sent',
            attempts
          };
        } else {
          lastError = response.data?.description || 'Telegram API returned not ok';
        }
      } catch (err: any) {
        lastError = err.response?.data?.description || err.message || 'Unknown network error';
        if (attempts < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, attempts * 500));
        }
      }
    }

    return {
      success: false,
      deliveryStatus: 'failed',
      error: lastError,
      attempts
    };
  }

  /**
   * Register Webhook with Telegram Bot API
   */
  public static async setWebhook(
    webhookUrl: string,
    secretToken?: string
  ): Promise<{ ok: boolean; description?: string }> {
    const token = this.getBotToken();
    if (!token) {
      return { ok: false, description: 'Telegram Bot Token not configured on server' };
    }

    try {
      const payload: Record<string, any> = {
        url: webhookUrl,
        allowed_updates: ['message', 'edited_message']
      };
      if (secretToken) {
        payload.secret_token = secretToken;
      }

      const res = await axios.post(`https://api.telegram.org/bot${token}/setWebhook`, payload, {
        timeout: 10000
      });
      return {
        ok: Boolean(res.data?.ok),
        description:
          res.data?.description ||
          (res.data?.ok ? 'Webhook registered successfully' : 'Failed to register webhook')
      };
    } catch (err: any) {
      return {
        ok: false,
        description:
          err.response?.data?.description || err.message || 'Network error setting webhook'
      };
    }
  }

  /**
   * Get Webhook Info from Telegram Bot API
   */
  public static async getWebhookInfo(): Promise<{
    ok: boolean;
    result?: any;
    description?: string;
  }> {
    const token = this.getBotToken();
    if (!token) {
      return { ok: false, description: 'Telegram Bot Token not configured on server' };
    }

    try {
      const res = await axios.get(`https://api.telegram.org/bot${token}/getWebhookInfo`, {
        timeout: 10000
      });
      return {
        ok: Boolean(res.data?.ok),
        result: res.data?.result,
        description: res.data?.description
      };
    } catch (err: any) {
      return {
        ok: false,
        description:
          err.response?.data?.description || err.message || 'Network error getting webhook info'
      };
    }
  }

  /**
   * Delete Webhook
   */
  public static async deleteWebhook(): Promise<{ ok: boolean; description?: string }> {
    const token = this.getBotToken();
    if (!token) {
      return { ok: false, description: 'Telegram Bot Token not configured on server' };
    }

    try {
      const res = await axios.post(`https://api.telegram.org/bot${token}/deleteWebhook`, {}, {
        timeout: 10000
      });
      return {
        ok: Boolean(res.data?.ok),
        description: res.data?.description || 'Webhook deleted'
      };
    } catch (err: any) {
      return {
        ok: false,
        description:
          err.response?.data?.description || err.message || 'Network error deleting webhook'
      };
    }
  }

  /**
   * Test Telegram connection with a safe ping message
   */
  public static async testConnection(chatId: string): Promise<TelegramSendResult> {
    return this.sendNotification({
      chatId,
      category: 'info',
      title: 'Family Diabetes Care: Telegram Connected',
      body: 'Hello! This is a test message from your Family Diabetes Care application. You will receive important blood sugar alerts and reminders here.',
      guidance: 'Notification integration is working properly.'
    });
  }
}

