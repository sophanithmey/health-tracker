import { NextResponse } from 'next/server';
import { HealthRepository } from '@/server/db/repository';

export async function GET() {
  try {
    const user = HealthRepository.getCurrentUser();
    return NextResponse.json({ success: true, data: user });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

