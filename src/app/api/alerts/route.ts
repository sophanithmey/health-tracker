import { NextResponse } from 'next/server';
import { HealthRepository } from '@/server/db/repository';
import { PATIENT_ID } from '@/server/db/inMemoryStore';

export async function GET() {
  try {
    const alerts = await HealthRepository.getNotifications(PATIENT_ID);
    return NextResponse.json({ success: true, data: alerts });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

