import { NextResponse } from 'next/server';
import { HealthRepository } from '@/server/db/repository';
import { TelegramService } from '@/server/services/telegramService';
import { PATIENT_ID } from '@/server/db/inMemoryStore';

export async function GET() {
  try {
    const reminders = await HealthRepository.getReminders(PATIENT_ID);
    const patient = await HealthRepository.getPatientProfile(PATIENT_ID);

    const activeReminders = reminders.filter((r) => r.isActive);
    const dispatched: string[] = [];

    // In a real cron run, check current time in Asia/Phnom_Penh
    if (patient.telegramChatId && patient.telegramNotificationsEnabled && activeReminders.length > 0) {
      // Sample reminder check
      dispatched.push(activeReminders[0].title);
    }

    return NextResponse.json({
      success: true,
      data: {
        checkedAt: new Date().toISOString(),
        totalActiveReminders: activeReminders.length,
        dispatched
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

