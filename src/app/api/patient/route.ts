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

export async function PUT(request: Request) {
  return PATCH(request);
}

export async function PATCH(request: Request) {
  try {
    const currentUser = HealthRepository.getCurrentUser();
    // Family admin and patient can update patient profile and emergency contacts
    if (currentUser.role !== 'family_admin' && currentUser.role !== 'patient') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Only authorized users can update patient profile' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validated = PatientProfileUpdateSchema.parse(body);
    const { patientId: validatedPatientId, ...profileUpdates } = validated;
    const targetId = body.patientId || validatedPatientId || undefined;
    const updated = await HealthRepository.updatePatientProfile(targetId, profileUpdates);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Failed to update patient profile:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

