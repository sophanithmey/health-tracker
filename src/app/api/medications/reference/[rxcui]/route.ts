// ============================================================================
// GET /api/medications/reference/[rxcui]
// Retrieves standardized RxNorm concept details, strengths, and dosage forms.
// ============================================================================

import { NextResponse } from 'next/server';
import { RxCuiParamSchema } from '@/server/schemas/medication-validation';
import { MedicationDetailService } from '@/server/services/medication-detail-service';
import { MedicationLabelService } from '@/server/services/medication-label-service';
import { MedicationSafetyService } from '@/server/services/medication-safety-service';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ rxcui: string }> }
) {
  try {
    const { rxcui } = await params;
    const validated = RxCuiParamSchema.parse({ rxcui });

    const detail = await MedicationDetailService.getDetailByRxcui(validated.rxcui);
    if (!detail) {
      return NextResponse.json(
        { success: false, error: `Medication concept not found for RxCUI: ${validated.rxcui}` },
        { status: 404 }
      );
    }

    // Parallel lookup of labels and safety information for rich reference view
    const [label, safety, splLabels] = await Promise.all([
      MedicationLabelService.getClinicalLabel(validated.rxcui, detail.genericName),
      MedicationSafetyService.getSafetyInfo(validated.rxcui, detail.genericName),
      MedicationLabelService.getSplLabels(detail.genericName)
    ]);

    return NextResponse.json({
      success: true,
      data: {
        concept: detail,
        label,
        safety,
        availableSplLabels: splLabels
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error fetching medication reference' },
      { status: 400 }
    );
  }
}
