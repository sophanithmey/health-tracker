// ============================================================================
// GET /api/medications/reference/[rxcui]/safety
// Retrieves openFDA safety warnings, contraindications, and adverse events.
// ============================================================================

import { NextResponse } from 'next/server';
import { RxCuiParamSchema } from '@/server/schemas/medication-validation';
import { MedicationDetailService } from '@/server/services/medication-detail-service';
import { MedicationSafetyService } from '@/server/services/medication-safety-service';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ rxcui: string }> }
) {
  try {
    const { rxcui } = await params;
    const validated = RxCuiParamSchema.parse({ rxcui });

    const detail = await MedicationDetailService.getDetailByRxcui(validated.rxcui);
    const drugName = detail?.genericName || detail?.name || validated.rxcui;

    const safety = await MedicationSafetyService.getSafetyInfo(validated.rxcui, drugName);

    return NextResponse.json({
      success: true,
      data: safety
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error fetching medication safety info' },
      { status: 400 }
    );
  }
}
