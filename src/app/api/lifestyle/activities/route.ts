import { NextResponse } from 'next/server';
import { HealthRepository } from '@/server/db/repository';
import { ActivityLogSchema } from '@/server/schemas/validation';
import { PATIENT_ID } from '@/server/db/inMemoryStore';

export async function GET() {
  try {
    const acts = await HealthRepository.getActivityLogs(PATIENT_ID);
    return NextResponse.json({ success: true, data: acts });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = ActivityLogSchema.parse(body);

    const act = await HealthRepository.createActivityLog({
      patientId: validated.patientId || PATIENT_ID,
      activityType: validated.activityType,
      durationMinutes: validated.durationMinutes,
      intensity: validated.intensity,
      loggedAt: validated.loggedAt,
      notes: validated.notes
    });

    return NextResponse.json({ success: true, data: act });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

