import { NextResponse } from 'next/server';
import { HealthRepository } from '@/server/db/repository';
import { MedicationDetailService } from '@/server/services/medication-detail-service';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if numeric RxCUI or reference query
    const isNumeric = /^[0-9]+$/.test(id);
    if (isNumeric) {
      const ref = await MedicationDetailService.getDetailByRxcui(id);
      if (ref) {
        return NextResponse.json({ success: true, data: ref });
      }
    }

    // Otherwise, check patient medications
    const activePatient = await HealthRepository.getPatientProfile();
    const meds = await HealthRepository.getMedications(activePatient.id);
    const found = meds.find((m) => m.id === id);

    if (found) {
      return NextResponse.json({ success: true, data: found });
    }

    // If still not found, try RxCUI detail lookup as fallback
    const fallbackRef = await MedicationDetailService.getDetailByRxcui(id);
    if (fallbackRef) {
      return NextResponse.json({ success: true, data: fallbackRef });
    }

    return NextResponse.json(
      { success: false, error: 'Medication not found' },
      { status: 404 }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = HealthRepository.getCurrentUser();
    if (currentUser.role !== 'family_admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Only family admin can edit medication details' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const updated = await HealthRepository.updateMedication(id, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Medication not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = HealthRepository.getCurrentUser();
    if (currentUser.role !== 'family_admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Only family admin can delete medication records' },
        { status: 403 }
      );
    }

    const { id } = await params;
    await HealthRepository.deleteMedication(id);
    return NextResponse.json({ success: true, message: 'Medication removed successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

