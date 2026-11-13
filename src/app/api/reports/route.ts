import { NextResponse } from 'next/server';
import { HealthRepository } from '@/server/db/repository';
import { PATIENT_ID } from '@/server/db/inMemoryStore';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const daysParam = searchParams.get('days');
    const days = daysParam ? parseInt(daysParam, 10) : 7;

    const summary = await HealthRepository.getHealthReportSummary(days, PATIENT_ID);
    const patient = await HealthRepository.getPatientProfile(PATIENT_ID);
    const targets = await HealthRepository.getGlucoseTargets(PATIENT_ID);

    return NextResponse.json({
      success: true,
      data: {
        summary,
        patient,
        targets,
        generatedAt: new Date().toISOString(),
        disclaimer:
          'DISCLAIMER: This health report is intended solely for personal family monitoring and to facilitate discussions with your healthcare provider. This summary does NOT provide a medical diagnosis, medication dosage modification, or treatment prescription.'
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

