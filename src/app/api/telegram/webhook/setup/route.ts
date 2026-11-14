// ============================================================================
// Telegram Webhook Management Endpoint
// GET /api/telegram/webhook/setup  -> Get current webhook status
// POST /api/telegram/webhook/setup -> Set or delete webhook
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { TelegramService } from '@/server/services/telegramService';
import { HealthRepository } from '@/server/db/repository';

export async function GET() {
  try {
    const info = await TelegramService.getWebhookInfo();
    return NextResponse.json({
      success: true,
      data: info
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = HealthRepository.getCurrentUser();
    if (currentUser.role !== 'family_admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Only family admin can manage webhook' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const action = body.action || 'set';

    if (action === 'delete') {
      const result = await TelegramService.deleteWebhook();
      return NextResponse.json({ success: result.ok, data: result });
    }

    if (action === 'info') {
      const info = await TelegramService.getWebhookInfo();
      return NextResponse.json({ success: true, data: info });
    }

    // Default: set webhook
    let webhookUrl = body.webhookUrl;
    if (!webhookUrl) {
      // Auto-construct webhook URL from host if available
      const host = request.headers.get('host');
      const protocol = request.headers.get('x-forwarded-proto') || 'https';
      if (host) {
        webhookUrl = `${protocol}://${host}/api/telegram/webhook`;
      }
    }

    if (!webhookUrl) {
      return NextResponse.json(
        { success: false, error: 'Missing webhookUrl parameter' },
        { status: 400 }
      );
    }

    const secretToken = body.secretToken || process.env.TELEGRAM_WEBHOOK_SECRET;
    const result = await TelegramService.setWebhook(webhookUrl, secretToken);

    return NextResponse.json({
      success: result.ok,
      data: {
        webhookUrl,
        ...result
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
