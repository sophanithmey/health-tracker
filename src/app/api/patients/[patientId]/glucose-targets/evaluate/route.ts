import { NextResponse } from 'next/server';
import { GlucoseTargetService } from '@/server/services/glucoseTargetService';
import { EvaluateGlucoseReadingSchema } from '@/server/schemas/validation';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    const { patientId } = await params;
    const body = await request.json();
    const validated = EvaluateGlucoseReadingSchema.parse({
      ...body,
      patientId
    });

    const result = await GlucoseTargetService.evaluateReading({
      valueMgDl: validated.valueMgDl,
      measurementType: validated.measurementType,
      measuredAt: validated.measuredAt,
      patientId
    });

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    const errorMsg = error?.errors?.[0]?.message || error.message;
    return NextResponse.json({ success: false, error: errorMsg }, { status: 400 });
  }
}

