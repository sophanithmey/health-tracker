import { NextResponse } from 'next/server';
import { HealthRepository } from '@/server/db/repository';
import { GlucoseReadingSchema } from '@/server/schemas/validation';
import { PATIENT_ID } from '@/server/db/inMemoryStore';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const measurementType = searchParams.get('measurementType') || undefined;
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!, 10) : 0;

    const result = await HealthRepository.getGlucoseRecords({
      patientId: PATIENT_ID,
      measurementType,
      startDate,
      endDate,
      limit,
      offset
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = GlucoseReadingSchema.parse(body);

    const currentUser = HealthRepository.getCurrentUser();

    const { record, alert } = await HealthRepository.createGlucoseRecord({
      patientId: validated.patientId || PATIENT_ID,
      valueMgDl: validated.valueMgDl,
      measurementType: validated.measurementType,
      measuredAt: validated.measuredAt,
      mealDescription: validated.mealDescription,
      symptoms: validated.symptoms,
      notes: validated.notes,
      recordedBy: currentUser.id,
      recordedByName: currentUser.fullName,
      recordedByRole: currentUser.role
    });

    return NextResponse.json({
      success: true,
      data: {
        record,
        alert
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

