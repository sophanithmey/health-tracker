import { NextResponse } from 'next/server';
import { HealthRepository } from '@/server/db/repository';
import { GlucoseTargetService } from '@/server/services/glucoseTargetService';
import { CreateGlucoseTargetSchema } from '@/server/schemas/validation';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    const { patientId } = await params;
    const targets = await GlucoseTargetService.getPatientTargets(patientId);
    const generalGuidelines = GlucoseTargetService.getGeneralGuidelines();

    return NextResponse.json({
      success: true,
      data: targets,
      generalGuidelines
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    const { patientId } = await params;
    const currentUser = HealthRepository.getCurrentUser();

    // Only family_admin or clinician can configure targets
    if (currentUser.role !== 'family_admin' && currentUser.role !== 'clinician') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Only family administrators and clinicians can configure targets' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validated = CreateGlucoseTargetSchema.parse({
      ...body,
      patientId
    });

    const target = await GlucoseTargetService.createTarget(
      {
        patientId,
        measurementType: validated.measurementType,
        minValue: validated.minValue ?? validated.targetMin,
        maxValue: validated.maxValue ?? validated.targetMax,
        unit: validated.unit,
        source: validated.source,
        effectiveFrom: validated.effectiveFrom,
        effectiveUntil: validated.effectiveUntil,
        notes: validated.notes,
        guidelineSource: validated.guidelineSource,
        guidelineVersion: validated.guidelineVersion
      },
      currentUser
    );

    return NextResponse.json({ success: true, data: target }, { status: 201 });
  } catch (error: any) {
    const errorMsg = error?.errors?.[0]?.message || error.message;
    return NextResponse.json({ success: false, error: errorMsg }, { status: 400 });
  }
}
