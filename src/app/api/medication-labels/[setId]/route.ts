// ============================================================================
// GET /api/medication-labels/[setId]
// Retrieves specific DailyMed Structured Product Label (SPL) information.
// ============================================================================

import { NextResponse } from 'next/server';
import { SetIdParamSchema } from '@/server/schemas/medication-validation';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ setId: string }> }
) {
  try {
    const { setId } = await params;
    const validated = SetIdParamSchema.parse({ setId });

    const sourceUrl = `https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=${validated.setId}`;
    const xmlUrl = `https://dailymed.nlm.nih.gov/dailymed/services/v2/spls/${validated.setId}.xml`;

    return NextResponse.json({
      success: true,
      data: {
        setId: validated.setId,
        source: 'DailyMed (U.S. National Library of Medicine)',
        jurisdiction: 'United States FDA Approved Package Insert',
        labelViewUrl: sourceUrl,
        labelXmlUrl: xmlUrl,
        disclaimer:
          'DailyMed provides official labeling information for marketed drugs in the United States. Formulation and brand availability in Cambodia may differ. Consult local physicians for country-specific formulations.'
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error fetching label metadata' },
      { status: 400 }
    );
  }
}
