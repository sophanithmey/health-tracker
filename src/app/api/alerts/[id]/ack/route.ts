import { NextResponse } from 'next/server';
import { HealthRepository } from '@/server/db/repository';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ok = await HealthRepository.acknowledgeNotification(id);
    if (!ok) {
      return NextResponse.json({ success: false, error: 'Alert not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Alert acknowledged' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

