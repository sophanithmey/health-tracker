// ============================================================================
// GET /api/medications/reference/[rxcui]/labels
// Retrieves DailyMed SPL labels and clinical sections for a drug.
// ============================================================================

import { NextResponse } from 'next/server';
import { RxCuiParamSchema } from '@/server/schemas/medication-validation';
import { MedicationDetailService } from '@/server/services/medication-detail-service';
import { MedicationLabelService } from '@/server/services/medication-label-service';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ rxcui: string }> }
) {
  try {
    const { rxcui } = await params;
    const validated = RxCuiParamSchema.parse({ rxcui });

    const detail = await MedicationDetailService.getDetailByRxcui(validated.rxcui);
    const drugName = detail?.genericName || detail?.name || validated.rxcui;

    const [splLabels, clinicalLabel] = await Promise.all([
      MedicationLabelService.getSplLabels(drugName),
      MedicationLabelService.getClinicalLabel(validated.rxcui, drugName)
    ]);

    return NextResponse.json({
      success: true,
      data: {
        rxcui: validated.rxcui,
        drugName,
        clinicalLabel,
        splLabels
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error fetching medication labels' },
      { status: 400 }
    );
  }
}
