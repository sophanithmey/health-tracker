import { NextResponse } from 'next/server';
import { lookupMedicationEducation } from '@/server/services/medlineConnectService';
import { MedicationEducationQuerySchema } from '@/server/schemas/validation';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || 'metformin';

    const validated = MedicationEducationQuerySchema.parse({ q });
    const results = await lookupMedicationEducation(validated.q);

    return NextResponse.json({ success: true, data: results });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

