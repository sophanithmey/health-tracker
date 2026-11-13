import { NextResponse } from 'next/server';
import { HealthRepository } from '@/server/db/repository';
import { TelegramConfigSchema } from '@/server/schemas/validation';
import { PATIENT_ID } from '@/server/db/inMemoryStore';

export async function POST(request: Request) {
  try {
    const currentUser = HealthRepository.getCurrentUser();
    if (currentUser.role !== 'family_admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Only family admin can configure Telegram' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validated = TelegramConfigSchema.parse(body);

    const updated = await HealthRepository.updatePatientProfile(validated.patientId || PATIENT_ID, {
      telegramChatId: validated.chatId,
      telegramNotificationsEnabled: validated.notificationsEnabled
    });

    return NextResponse.json({
      success: true,
      data: {
        chatId: updated.telegramChatId,
        notificationsEnabled: updated.telegramNotificationsEnabled
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

