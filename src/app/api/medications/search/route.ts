// ============================================================================
// GET /api/medications/search?q={query}&limit={limit}
// Searches medications across RxNorm and curated diabetes drug database.
// ============================================================================

import { NextResponse } from 'next/server';
import { MedicationSearchSchema } from '@/server/schemas/medication-validation';
import { MedicationSearchService } from '@/server/services/medication-search-service';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const qParam = searchParams.get('q') || '';
    const limitParam = searchParams.get('limit') || undefined;

    const validated = MedicationSearchSchema.parse({
      q: qParam,
      limit: limitParam
    });

    const result = await MedicationSearchService.search(validated.q, validated.limit);

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Invalid search parameters' },
      { status: 400 }
    );
  }
}

