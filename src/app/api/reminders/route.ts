import { NextResponse } from 'next/server';
import { HealthRepository } from '@/server/db/repository';
import { ReminderSchema } from '@/server/schemas/validation';
import { PATIENT_ID } from '@/server/db/inMemoryStore';

export async function GET() {
  try {
    const rems = await HealthRepository.getReminders(PATIENT_ID);
    return NextResponse.json({ success: true, data: rems });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = HealthRepository.getCurrentUser();
    if (currentUser.role !== 'family_admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Only family admin can configure reminders' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validated = ReminderSchema.parse(body);

    const rem = await HealthRepository.saveReminder({
      id: body.id,
      patientId: validated.patientId || PATIENT_ID,
      reminderType: validated.reminderType,
      title: validated.title,
      titleKm: validated.titleKm,
      timeOfDay: validated.timeOfDay,
      daysOfWeek: validated.daysOfWeek,
      isActive: validated.isActive,
      notes: validated.notes
    });

    return NextResponse.json({ success: true, data: rem });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

