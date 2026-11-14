import { NextResponse } from 'next/server';
import { HealthRepository } from '@/server/db/repository';
import { GlucoseTargetService } from '@/server/services/glucoseTargetService';
import { UpdateGlucoseTargetSchema } from '@/server/schemas/validation';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ patientId: string; targetId: string }> }
) {
  try {
    const { targetId } = await params;
    const currentUser = HealthRepository.getCurrentUser();

    if (currentUser.role !== 'family_admin' && currentUser.role !== 'clinician') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Only family administrators and clinicians can modify targets' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validated = UpdateGlucoseTargetSchema.parse(body);

    const updated = await GlucoseTargetService.updateTarget(
      targetId,
      {
        minValue: validated.minValue ?? validated.targetMin,
        maxValue: validated.maxValue ?? validated.targetMax,
        notes: validated.notes,
        effectiveFrom: validated.effectiveFrom,
        effectiveUntil: validated.effectiveUntil,
        reason: validated.reason
      },
      currentUser
    );

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Target not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    const errorMsg = error?.errors?.[0]?.message || error.message;
    return NextResponse.json({ success: false, error: errorMsg }, { status: 400 });
  }
}

