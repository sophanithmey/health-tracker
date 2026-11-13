import { NextResponse } from 'next/server';
import { HealthRepository } from '@/server/db/repository';
import { PatientProfileUpdateSchema } from '@/server/schemas/validation';

export async function GET() {
  try {
    const patient = await HealthRepository.getPatientProfile();
    return NextResponse.json({ success: true, data: patient });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const currentUser = HealthRepository.getCurrentUser();
    // Only family_admin can update patient medical profile
    if (currentUser.role !== 'family_admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Only family admin can update patient profile' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validated = PatientProfileUpdateSchema.partial().parse(body);
    const updated = await HealthRepository.updatePatientProfile(body.patientId || undefined, validated);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

