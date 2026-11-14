import { NextResponse } from 'next/server';
import { searchHealthKnowledge } from '@/server/services/knowledgeService';
import { KnowledgeSearchSchema } from '@/server/schemas/validation';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || 'diabetes';
    const category = searchParams.get('category') || undefined;

    const validated = KnowledgeSearchSchema.parse({ q, category });
    const results = await searchHealthKnowledge(validated.q);

    // If category filter was passed, filter by category
    const filtered = validated.category
      ? results.filter((r) => r.category === validated.category)
      : results;

    return NextResponse.json({ success: true, data: filtered });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

