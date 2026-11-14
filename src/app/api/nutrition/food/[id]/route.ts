import { NextResponse } from 'next/server';
import { getUsdaFoodDetail } from '@/server/services/usdaFoodService';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const fdcId = parseInt(id, 10);
    if (isNaN(fdcId)) {
      return NextResponse.json({ success: false, error: 'Invalid food ID' }, { status: 400 });
    }

    const food = await getUsdaFoodDetail(fdcId);
    if (!food) {
      return NextResponse.json({ success: false, error: 'Food item not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: food });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
