import { NextResponse } from 'next/server';
import { searchUsdaFoods } from '@/server/services/usdaFoodService';
import { NutritionSearchSchema } from '@/server/schemas/validation';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    const pageSize = searchParams.get('pageSize') || '10';

    if (!q || !q.trim()) {
      return NextResponse.json({ success: true, data: [] });
    }

    const validated = NutritionSearchSchema.parse({ q: q.trim(), pageSize });
    const foods = await searchUsdaFoods(validated.q, validated.pageSize);

    return NextResponse.json({ success: true, data: foods });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

