import { NextResponse } from 'next/server';
import { HealthRepository } from '@/server/db/repository';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updated = await HealthRepository.updateGlucoseRecord(id, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Record not found' }, { status: 404 });
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
    const { id } = await params;
    const currentUser = HealthRepository.getCurrentUser();
    // Only family_admin can delete readings
    if (currentUser.role !== 'family_admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Only family caregiver admin can delete records' },
        { status: 403 }
      );
    }

    const deleted = await HealthRepository.deleteGlucoseRecord(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Record not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Record deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

