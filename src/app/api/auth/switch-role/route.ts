import { NextResponse } from 'next/server';
import { HealthRepository } from '@/server/db/repository';
import { UserRole } from '@/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const role: UserRole = body.role === 'patient' ? 'patient' : 'family_admin';
    HealthRepository.setActiveRole(role);
    const updatedUser = HealthRepository.getCurrentUser();
    return NextResponse.json({ success: true, data: updatedUser });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

