import { NextResponse } from 'next/server';
import { HealthRepository } from '@/server/db/repository';
import { GlucoseTargetService } from '@/server/services/glucoseTargetService';
import { ApproveRejectTargetSchema } from '@/server/schemas/validation';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ patientId: string; targetId: string }> }
) {
  try {
    const { targetId } = await params;
    const currentUser = HealthRepository.getCurrentUser();

    // Check authorization: clinicians can always approve; family_admin can approve if authorized
    if (currentUser.role !== 'clinician' && currentUser.role !== 'family_admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Only authorized clinicians or family administrators can approve targets' },
        { status: 403 }
      );
    }

    let body = {};
    try {
      body = await request.json();
    } catch {
      // Body is optional
    }
    const validated = ApproveRejectTargetSchema.parse(body);

    const approved = await GlucoseTargetService.approveTarget(
      targetId,
      {
        reason: validated.reason || 'Target clinically approved',
        notes: validated.notes
      },
      currentUser
    );

    if (!approved) {
      return NextResponse.json({ success: false, error: 'Target not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: approved });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

