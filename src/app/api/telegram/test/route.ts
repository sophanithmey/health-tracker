import { NextResponse } from 'next/server';
import { TelegramService } from '@/server/services/telegramService';
import { HealthRepository } from '@/server/db/repository';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const patient = await HealthRepository.getPatientProfile();
    const chatId = body.chatId || patient.telegramChatId;

    if (!chatId) {
      return NextResponse.json(
        { success: false, error: 'Telegram Chat ID is not configured' },
        { status: 400 }
      );
    }

    const result = await TelegramService.testConnection(chatId);
    return NextResponse.json({ success: result.success, data: result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

