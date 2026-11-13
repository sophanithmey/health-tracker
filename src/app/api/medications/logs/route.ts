import { NextResponse } from 'next/server';
import { HealthRepository } from '@/server/db/repository';
import { MedicationLogSchema } from '@/server/schemas/validation';
import { PATIENT_ID } from '@/server/db/inMemoryStore';

export async function GET() {
  try {
    const logs = await HealthRepository.getMedicationLogs(PATIENT_ID);
    return NextResponse.json({ success: true, data: logs });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = MedicationLogSchema.parse(body);

    const meds = await HealthRepository.getMedications(PATIENT_ID);
    const med = meds.find((m) => m.id === validated.medicationId);
    const medName = med ? `${med.name} (${med.dosage})` : 'Prescribed Medication';

    const log = await HealthRepository.recordMedicationLog({
      medicationId: validated.medicationId,
      medicationName: medName,
      patientId: validated.patientId || PATIENT_ID,
      status: validated.status,
      scheduledTime: validated.scheduledTime,
      recordedTime: validated.recordedTime || new Date().toISOString(),
      notes: validated.notes
    });

    return NextResponse.json({ success: true, data: log });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

