import { NextResponse } from 'next/server';
import { HealthRepository } from '@/server/db/repository';

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

