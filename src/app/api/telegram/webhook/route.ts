// ============================================================================
// Telegram Inbound Webhook Endpoint
// POST /api/telegram/webhook
// Handles incoming messages from Telegram Bot API for Family Diabetes Care
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { TelegramInboundService, TelegramUpdate } from '@/server/services/telegramInboundService';

export async function POST(request: NextRequest) {
  try {
    // 1. Verify Secret Token if TELEGRAM_WEBHOOK_SECRET is configured
    const configuredSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
    if (configuredSecret) {
      const headerSecret = request.headers.get('x-telegram-bot-api-secret-token');
      if (headerSecret !== configuredSecret) {
        console.warn('[Telegram Webhook] Unauthorized request: secret token mismatch');
        return NextResponse.json({ ok: false, error: 'Unauthorized secret token' }, { status: 401 });
      }
    }

    // 2. Parse Incoming Update JSON
    const body: TelegramUpdate = await request.json();

    if (!body || !body.update_id) {
      return NextResponse.json({ ok: true, ignored: 'No valid update_id' });
    }

    // 3. Process update asynchronously via TelegramInboundService
    const result = await TelegramInboundService.handleUpdate(body);

    return NextResponse.json({
      ok: true,
      processed: result.processed,
      replySent: result.replySent
    });
  } catch (error: any) {
    console.error('[Telegram Webhook Error]:', error);
    // Always return 200 ok to Telegram Bot API to avoid continuous retries of malformed requests
    return NextResponse.json({ ok: true, error: error.message });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'active',
    endpoint: '/api/telegram/webhook',
    description: 'Family Diabetes Care Two-Way Telegram Inbound Webhook',
    timestamp: new Date().toISOString()
  });
}

