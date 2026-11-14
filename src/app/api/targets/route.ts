import { NextResponse } from 'next/server';
import { HealthRepository } from '@/server/db/repository';
import { GlucoseTargetSchema } from '@/server/schemas/validation';
import { PATIENT_ID } from '@/server/db/inMemoryStore';

export async function GET() {
  try {
    const targets = await HealthRepository.getGlucoseTargets(PATIENT_ID);
    return NextResponse.json({ success: true, data: targets });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = HealthRepository.getCurrentUser();
    if (currentUser.role !== 'family_admin' && currentUser.role !== 'clinician') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Only family admin or clinician can configure targets' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validated = GlucoseTargetSchema.parse(body);

    const saved = await HealthRepository.saveGlucoseTarget({
      patientId: validated.patientId || PATIENT_ID,
      measurementType: validated.measurementType,
      targetMin: validated.targetMin,
      targetMax: validated.targetMax,
      lowAlertThreshold: validated.lowAlertThreshold,
      highAlertThreshold: validated.highAlertThreshold,
      clinicianApprovalStatus: validated.clinicianApprovalStatus,
      clinicianNotes: validated.clinicianNotes
    });

    return NextResponse.json({ success: true, data: saved });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

