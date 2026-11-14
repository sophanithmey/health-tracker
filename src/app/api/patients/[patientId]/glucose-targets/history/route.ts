import { NextResponse } from 'next/server';
import { GlucoseTargetService } from '@/server/services/glucoseTargetService';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    const { patientId } = await params;
    const auditLogs = await GlucoseTargetService.getAuditLogs(patientId);

    return NextResponse.json({
      success: true,
      data: auditLogs
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

